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
  SLIDER_FORWARD_PERIOD,
  SLIDER_FORWARD_INTERVAL,
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
 * Get time key.
 * @param {Date|Number} timestamp of date or milliseconds
 * @returns {Number} time key
 */
const getTimeKey = (t) => {
  const d = moment(t).toDate();
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d.getTime();
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
    event.timeKey = getTimeKey(m); // timeKey is without seconds/milliseconds
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
      sliderTimestamp: Date.now(),
      clickedEvents: [], // events clicked by the user
      allEvents: [], // all events received from the backend
    };
    this.displayEventBox = this.displayEventBox.bind(this);
    this.play = this.play.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  /**
   * Called when component is mounted.
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
        const { allEvents } = prevState;
        return { allEvents: [...allEvents, ...events] };
      });
    });
    socket.on('error', (error) => {
      alert(`Got error ${error}`); // eslint-disable-line
    });

    this.play();

    // cleanup expired old events
    this.cleanupInterval = setInterval(() => {
      const {
        allEvents, clickedEvents,
      } = this.state;
      const minDate = getMinDate();
      const deleted = [];
      for (let i = 0; i < allEvents.length; i += 1) {
        if (allEvents[i].timestamp < minDate) {
          deleted.push(allEvents[i]);
        }
      }

      if (deleted.length > 0) {
        const newState = {
          allEvents: allEvents.filter(e => !_.find(deleted, d => d.uuid === e.uuid)),
          clickedEvents: clickedEvents.filter(e => !_.find(deleted, d => d.uuid === e.uuid)),
        };
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
    if (this.playInterval) {
      clearTimeout(this.playInterval);
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
    this.setState({
      isDragging: false,
      sliderTimestamp: timestamp,
    });
  }

  /**
   * On drag
   * @param {Number} timestamp the drag timestamp
   */
  onDrag(timestamp) {
    const { isDragging } = this.state;

    if (!isDragging) {
      return;
    }

    this.setState({
      sliderTimestamp: timestamp,
    });
  }

  /**
   * Play with the slider bar.
   */
  play() {
    this.playInterval = setInterval(() => {
      const {
        sliderTimestamp, isDragging,
      } = this.state;

      if (isDragging) {
        // do not play slider when dragging
        return;
      }

      let ts = sliderTimestamp + SLIDER_FORWARD_INTERVAL;
      const currentTimeKey = getTimeKey(new Date());
      if (ts > currentTimeKey) {
        ts = currentTimeKey;
      }
      if (ts !== sliderTimestamp) {
        this.setState({ sliderTimestamp: ts });
      }
    }, SLIDER_FORWARD_PERIOD);
  }

  /**
   * Display event box on user click.
   * @param {Object} eventLoc the event location user clicked
   */
  displayEventBox(eventLoc) {
    const { allEvents, sliderTimestamp } = this.state;

    // find the event closet to and before sliderTimestamp
    let minDistance = Number.MAX_SAFE_INTEGER;
    let event;

    _.each(allEvents, (evt) => {
      const distance = sliderTimestamp - evt.timeKey;
      if (distance >= 0 && distance < minDistance && evt.location === eventLoc.location) {
        minDistance = distance;
        event = evt;
      }
    });
    if (!event) {
      return;
    }

    // add the event to clickedEvents
    this.setState((prevState) => {
      const newClickedEvents = [...prevState.clickedEvents, event];
      return { clickedEvents: newClickedEvents };
    });
    // remove clicked event after a time out
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
      clickedEvents, allEvents, sliderTimestamp,
    } = this.state;

    const sliderTimeKey = getTimeKey(sliderTimestamp);
    const events = _.filter(allEvents, e => e.timeKey <= sliderTimeKey);
    const activeEvents = _.filter(events, e => e.timeKey === sliderTimeKey);
    const filteredClickedEvents = _.filter(clickedEvents, e => e.timeKey <= sliderTimeKey);
    const eventLocs = [];
    _.forEach(events, (e) => {
      if (!_.find(eventLocs, el => el.location === e.location)) {
        eventLocs.push({ ...countryData[e.location], location: e.location });
      }
    });

    return (
      <div className={styles.App}>
        <Sidebar />
        <EventMap
          activeEvents={activeEvents}
          clickedEvents={filteredClickedEvents}
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
