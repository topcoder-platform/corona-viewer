import React from 'react';
import moment from 'moment';
import openSocket from 'socket.io-client';
import uuid from 'uuid/v4';
import EventMap from 'components/EventMap';
import Sidebar from 'components/Sidebar';
import {
  MAX_EVENT_COUNT,
  EVENT_FADE_TIME,
  ALLOWED_EVENT_TOPICS,
  ALLOWED_EVENT_TYPES,
  IGNORED_EVENT_TYPES,
  SERVER_URL,
} from 'config/index';
// `countrydata.json` file generated using
// https://gist.github.com/tadast/8827699
import countryData from './countrydata.json';
import styles from './styles.scss';

const normalizeEvent = (ev) => {
  const event = { ...ev };
  // Add ID (used for active event dot implementation and list keys)
  event.uuid = uuid();
  // Add location coordinates
  if ('location' in event && event.location in countryData) {
    // get coordinates from country location data
    event.lat = countryData[event.location].lat;
    event.lng = countryData[event.location].lng;
    // add display location string
    event.locationStr = countryData[event.location].country;
  } else {
    // else add default location (Virginia (US)); coordinates from
    // https://www.latlong.net/place/virginia-usa-8997.html
    event.lat = 37.926868;
    event.lng = -78.024902;
    // add display location string
    event.locationStr = 'Virginia, USA';
  }
  if ('createdAt' in event) {
    // add display createdAt string
    const m = moment(event.createdAt, 'YYYY-MM-DDTHH:mm:ss.SSS');
    event.createdAtStr = m.format('MM/DD/YYYY HH:mm');
  }

  return event;
};

const getURLParams = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const keys = Array.from(searchParams.keys());
  const entries = keys.map(key => ({ key, value: searchParams.getAll(key) }));

  return entries;
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeEvent: null, // last event received from the backend
      clickedEvents: [], // events clicked by the user
      events: [], // all events received from the backend
    };
    this.displayEventBox = this.displayEventBox.bind(this);
  }

  componentDidMount() {
    const socket = openSocket(SERVER_URL);
    const paramFilters = getURLParams();

    socket.on('message', (eventStr) => {
      const evt = normalizeEvent(JSON.parse(eventStr));

      // check if the event should be ignored
      if (IGNORED_EVENT_TYPES.includes(evt.type)) {
        // eslint-disable-next-line
        console.log(`Ignoring event with type: ${evt.type}`);
        return;
      }
      if (!(
        ALLOWED_EVENT_TYPES.includes(evt.type)
        || ALLOWED_EVENT_TOPICS.includes(evt.topic)
      )) {
        // letting an event that is not yet handled by the
        // app makes the UI seem broken; don't display them
        // eslint-disable-next-line
        console.log(`This event is not yet handled (type: ${evt.type}; topic: ${evt.topic})`);
        return;
      }

      // check that the url filters are matching the new event
      const isMatchingFilters = paramFilters.every(filter => (
        filter.value.indexOf(`${evt[filter.key]}`) > -1));
      if (!isMatchingFilters) {
        // eslint-disable-next-line
        console.log(`Event filtered out (type: ${evt.type}; topic: ${evt.topic})`);
        return;
      }

      // else handle new event
      this.setState((prevState) => {
        const newEvents = [...prevState.events, evt];
        if (newEvents.length > Number(MAX_EVENT_COUNT)) {
          newEvents.shift();
        }
        return { events: newEvents };
      });
      this.setState({ activeEvent: evt });
    });
    socket.on('error', (error) => {
      alert(`Got error ${error}`); // eslint-disable-line
    });
  }

  displayEventBox(event) {
    const { activeEvent, clickedEvents } = this.state;
    if (activeEvent && event.uuid === activeEvent.uuid) {
      // case when the user clicks on the last event received
      // from the backend; it shouldn't be displayed twice (as
      // activeEvent and clickedEvents)
      return;
    }
    const existing = clickedEvents.filter(e => e.uuid === event.uuid);
    if (existing.length > 0) {
      // case when the user clicks on an event he already clicked
      // on; don't try to display the same event more than once
      return;
    }
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
    }, EVENT_FADE_TIME);
  }

  render() {
    const { activeEvent, clickedEvents, events } = this.state;
    return (
      <div className={styles.App}>
        <Sidebar />
        <EventMap
          activeEvent={activeEvent}
          clickedEvents={clickedEvents}
          displayEventBox={this.displayEventBox}
          events={events}
        />
      </div>
    );
  }
}

export default App;
