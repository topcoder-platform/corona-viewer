import React from 'react';
import moment from 'moment';
import openSocket from 'socket.io-client';
import uuid from 'uuid/v4';
import _ from 'lodash';
import EventMap from 'components/EventMap';
import Slider from 'components/Slider';
import Sidebar from 'components/Sidebar';
import {
  CLICK_EVENT_FADE_TIME,
  SLIDER_EVENT_FADE_TIME,
  EXPIRED_EVENTS_CLEAN_INTERVAL,
  ALLOWED_EVENT_TOPICS,
  ALLOWED_EVENT_TYPES,
  IGNORED_EVENT_TYPES,
  SERVER_URL,
} from 'config/index';
import { getMinDate } from 'helper/index';
// `countrydata.json` file generated using
// https://gist.github.com/tadast/8827699
import countryData from './countrydata.json';
import styles from './styles.scss';

// default location (Virginia (US)); coordinates from
// https://www.latlong.net/place/virginia-usa-8997.html
const DEFAULT_LOC = 'Virginia, USA';
countryData[DEFAULT_LOC] = {
  country: DEFAULT_LOC,
  lat: 37.926868,
  lng: -78.024902,
};

/**
 * Get URL parameters.
 * @returns {Array} URL parameters
 */
const getURLParams = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const keys = Array.from(searchParams.keys());
  const entries = keys.map(key => ({ key, value: searchParams.getAll(key) }));

  return entries;
};

/**
 * Normalize event.
 * @param {Object} evt event
 * @param {Object} paramFilters URL parameters
 * @returns {Object} normalized event; undefined is returned if event is invalid or filtered out
 */
const normalizeEvent = (evt, paramFilters) => {
  // check if the event should be ignored
  if (IGNORED_EVENT_TYPES.includes(evt.type)) {
    // eslint-disable-next-line
    console.log(`Ignoring event with type: ${evt.type}`);
    return undefined;
  }
  if (!(
    ALLOWED_EVENT_TYPES.includes(evt.type)
    || ALLOWED_EVENT_TOPICS.includes(evt.topic)
  )) {
    // letting an event that is not yet handled by the
    // app makes the UI seem broken; don't display them
    // eslint-disable-next-line
    console.log(`This event is not yet handled (type: ${evt.type}; topic: ${evt.topic})`);
    return undefined;
  }

  // check that the url filters are matching the new event
  const isMatchingFilters = paramFilters.every(filter => (
    filter.value.indexOf(`${evt[filter.key]}`) > -1));
  if (!isMatchingFilters) {
    // eslint-disable-next-line
    console.log(`Event filtered out (type: ${evt.type}; topic: ${evt.topic})`);
    return undefined;
  }

  const event = { ...evt };

  // add ID (used for active events list keys)
  event.uuid = uuid();

  // set default location
  if (!event.location || !(event.location in countryData)) {
    event.location = DEFAULT_LOC;
  }
  // get coordinates from country location data
  event.lat = countryData[event.location].lat;
  event.lng = countryData[event.location].lng;
  // add display location string
  event.locationStr = countryData[event.location].country;

  if ('createdAt' in event) {
    // add display createdAt string
    const m = moment.utc(event.createdAt).toDate();
    event.timestamp = m.getTime();
    if (event.timestamp < getMinDate()) {
      // eslint-disable-next-line
      console.log(`Ignore old event (timestamp: ${m.toLocaleString()})`);
      return undefined;
    }
    m.setSeconds(0);
    m.setMilliseconds(0);
    event.timeKey = m.getTime(); // timeKey is without seconds/milliseconds
    event.createdAtStr = moment(m).format('MM/DD/YYYY HH:mm');
    return event;
  }
  return undefined;
};

/**
 * The app component.
 */
class App extends React.Component {
  /**
   * Constructor.
   * @param {Object} props the component properties
   */
  constructor(props) {
    super(props);
    this.state = {
      isDragging: false,
      playTimestamp: 0,
      sliderTimestamp: 0,
      activeEvents: [], // active events shown
      clickedEvents: [], // events clicked by the user
      eventStep: 0, // for same time and location, multiple events may exist, show them in steps
      eventsByTime: {}, // all events received from the backend, map from timestamp to event
      eventsByLoc: {}, // all events received from the backend, map from location to event
    };
    this.displayEventBox = this.displayEventBox.bind(this);
    this.play = this.play.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  /**
   * Called when component is mount.
   */
  componentDidMount() {
    const socket = openSocket(SERVER_URL);

    socket.on('message', (eventStr) => {
      // parse events
      let eventJson = JSON.parse(eventStr);
      if (!_.isArray(eventJson)) {
        eventJson = [eventJson];
      }

      // normalize events
      const events = [];
      const paramFilters = getURLParams();
      _.each(eventJson, (evt) => {
        const event = normalizeEvent(evt, paramFilters);
        if (event) {
          events.push(event);
        }
      });

      if (!events.length) {
        return;
      }

      // handle new events
      this.setState((prevState) => {
        const { eventsByTime, eventsByLoc, activeEvents } = prevState;

        _.each(events, (evt) => {
          eventsByTime[evt.timeKey] = eventsByTime[evt.timeKey] || [];
          eventsByTime[evt.timeKey].push(evt);

          eventsByLoc[evt.location] = eventsByLoc[evt.location] || [];
          eventsByLoc[evt.location].push(evt);

          if (activeEvents.length && evt.timeKey === activeEvents[0].timeKey) {
            const found = _.find(activeEvents, ae => ae.location === evt.location);
            if (!found) {
              activeEvents.push(evt);
            } else {
              activeEvents[activeEvents.indexOf(found)] = evt;
            }
          }
        });

        return { eventsByTime, eventsByLoc, activeEvents };
      });
    });
    socket.on('error', (error) => {
      alert(`Got error ${error}`); // eslint-disable-line
    });

    this.play();

    // cleanup expired old events
    this.cleanupInterval = setInterval(() => {
      const {
        eventsByTime, eventsByLoc, activeEvents, clickedEvents,
      } = this.state;
      const timeKeys = _.keys(eventsByTime).sort();
      const minDate = getMinDate();
      const deleted = [];
      for (let i = 0; i < timeKeys.length; i += 1) {
        if (timeKeys[i] < minDate) {
          deleted.push(...eventsByTime[timeKeys[i]]);
          delete eventsByTime[timeKeys[i]];
        } else {
          break;
        }
      }

      if (deleted.length) {
        const newState = { eventsByTime, eventsByLoc };
        newState.activeEvents = activeEvents.filter(e => !_.find(deleted, d => d.uuid === e.uuid));
        newState.clickedEvents = clickedEvents
          .filter(e => !_.find(deleted, d => d.uuid === e.uuid));

        _.each(deleted, (d) => {
          eventsByLoc[d.location] = eventsByLoc[d.location].filter(e => d.uuid !== e.uuid);
          if (!eventsByLoc[d.location].length) {
            delete eventsByLoc[d.location];
          }
        });
        this.setState(newState);
      }
    }, EXPIRED_EVENTS_CLEAN_INTERVAL);
  }

  /**
   * Called when component unmount.
   */
  componentWillUnmount() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    if (this.playTimeout) {
      clearTimeout(this.playTimeout);
    }
  }

  /**
   * On drag start.
   */
  onDragStart() {
    this.setState({ isDragging: true });
  }

  /**
   * On drag end.
   * @param {Number} timestamp the end timestamp
   */
  onDragEnd(timestamp) {
    const m = moment(timestamp).toDate();
    m.setSeconds(0);
    m.setMilliseconds(0);
    const ts = m.getTime();

    this.setState({
      isDragging: false, playTimestamp: ts, sliderTimestamp: ts, eventStep: 0,
    });
  }

  /**
   * On drag, show the events near to the timestamp.
   * @param {Number} timestamp the drag timestamp
   */
  onDrag(timestamp) {
    const { eventsByTime } = this.state;

    const timeKeys = _.keys(eventsByTime).sort();
    let timeKey;
    for (let i = timeKeys.length - 1; i >= 0; i -= 1) {
      if (timeKeys[i] <= timestamp) {
        timeKey = timeKeys[i];
        break;
      }
    }

    const newState = { playTimestamp: timestamp, sliderTimestamp: timestamp, eventStep: 0 };
    if (timeKey) {
      const groupedEvents = _.groupBy(eventsByTime[timeKey], 'location');
      const locs = _.keys(groupedEvents);

      const events = [];
      _.each(locs, (loc) => {
        events.push(groupedEvents[loc][groupedEvents[loc].length - 1]);
      });
      newState.activeEvents = events;
    }
    this.setState(newState);
  }

  /**
   * Play with the slider bar.
   */
  play() {
    const {
      playTimestamp, sliderTimestamp, eventsByTime, isDragging,
    } = this.state;
    let { eventStep } = this.state;

    if (isDragging) {
      // don't mess with dragging
      this.playTimeout = setTimeout(this.play, 1000);
      return;
    }

    // find the timeKey according to playTimestamp
    const timeKeys = _.keys(eventsByTime).sort();
    let timeKey;
    for (let i = 0; i < timeKeys.length; i += 1) {
      if (timeKeys[i] >= playTimestamp) {
        timeKey = timeKeys[i];
        break;
      }
    }

    if (!timeKey) {
      if (timeKeys.length) {
        // move the slider bar to end
        this.setState({ sliderTimestamp: Date.now() });
      }
      // doesn't have events shown, loop by 1 second for next iteration
      this.playTimeout = setTimeout(this.play, 1000);
    } else {
      // group the events at timeKey by location.
      // note for same timeKey and same location, multiple events may exist,
      // we need play them step by step (with timestamp not changing).
      const groupedEvents = _.groupBy(eventsByTime[timeKey], 'location');
      const locs = _.keys(groupedEvents);

      let maxStep = 0;
      const events = [];

      _.each(locs, (loc) => {
        const step = groupedEvents[loc].length - 1;
        if (step > maxStep) {
          maxStep = step;
        }
        events.push(groupedEvents[loc][Math.min(eventStep, step)]);
      });

      let nextTS = Number(timeKey);

      eventStep += 1;
      if (eventStep > maxStep) {
        eventStep = 0;
        nextTS += 1;
      }

      const newState = { activeEvents: events, playTimestamp: nextTS, eventStep };
      if (playTimestamp === sliderTimestamp) {
        newState.sliderTimestamp = nextTS;
      }
      this.setState(newState);

      // Has events shown, timeout by configured fade time
      this.playTimeout = setTimeout(this.play, SLIDER_EVENT_FADE_TIME);
    }
  }

  /**
   * Display event box on user click.
   * @param {Object} eventLoc the event location user clicked
   */
  displayEventBox(eventLoc) {
    const { eventsByLoc, playTimestamp } = this.state;
    const events = eventsByLoc[eventLoc.location];

    // find the event closet to playTimestamp
    let minDistance = Number.MAX_SAFE_INTEGER;
    let event;

    _.each(events, (evt) => {
      const distance = Math.abs(evt.timestamp - playTimestamp);
      if (distance < minDistance) {
        minDistance = distance;
        event = evt;
      }
    });

    // add the event to clickedEvents
    this.setState((prevState) => {
      const newClickedEvents = [...prevState.clickedEvents, event];
      return { clickedEvents: newClickedEvents };
    });
    // remove the event after a time out
    setTimeout(() => {
      this.setState((prevState) => {
        const newClickedEvents = [...prevState.clickedEvents];
        newClickedEvents.shift();
        return { clickedEvents: newClickedEvents };
      });
    }, CLICK_EVENT_FADE_TIME);
  }

  /**
   * Render component.
   * @returns {Object} rendered component
   */
  render() {
    const {
      activeEvents, clickedEvents, eventsByLoc, sliderTimestamp,
    } = this.state;

    const eventLocs = _.map(_.keys(eventsByLoc),
      location => ({ ...countryData[location], location }));
    return (
      <div className={styles.App}>
        <Sidebar />
        <EventMap
          activeEvents={activeEvents}
          clickedEvents={clickedEvents}
          displayEventBox={this.displayEventBox}
          eventLocs={eventLocs}
        />
        <Slider
          sliderTimestamp={Number(sliderTimestamp)}
          onDrag={this.onDrag}
          onDragStart={this.onDragStart}
          onDragEnd={this.onDragEnd}
        />
      </div>
    );
  }
}

export default App;
