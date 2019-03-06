import React from 'react';
import PropTypes from 'prop-types';
import GoogleMapReact from 'google-map-react';
import EventDot from 'components/EventDot';
import EventBox from 'components/EventBox';
import { GOOGLE_MAP_KEY } from 'config/index';
import mapStyles from './mapstyles.json';

const isClicked = (uuid, events) => {
  const filtered = events.filter(e => e.uuid === uuid);
  if (filtered.length > 0) {
    return true;
  }
  return false;
};

const EventMap = ({
  activeEvent,
  clickedEvents,
  displayEventBox,
  events,
}) => (
  // Important! Always set the container height explicitly
  // (`google-map-react` lib)
  <div style={{ height: '1080px', width: '100%' }}>
    <GoogleMapReact
      bootstrapURLKeys={{ key: GOOGLE_MAP_KEY }}
      defaultCenter={{
        lat: 20,
        lng: -10,
      }}
      defaultZoom={3}
      options={{ styles: mapStyles, minZoom: 1 }}
      disableDefaultUI
    >
      {
        events.map(event => (
          <EventDot
            key={event.uuid}
            lat={event.lat}
            lng={event.lng}
            active={
              isClicked(event.uuid, clickedEvents)
              || (activeEvent && activeEvent.uuid === event.uuid)
            }
            displayEventBox={displayEventBox}
            event={event}
          />
        ))
      }
      {
        activeEvent ? (
          <EventBox
            lat={activeEvent.lat}
            lng={activeEvent.lng}
            event={activeEvent}
          />
        )
          : null
      }
      {
        clickedEvents.map(event => (
          <EventBox
            key={event.uuid}
            lat={event.lat}
            lng={event.lng}
            event={event}
          />
        ))
      }
    </GoogleMapReact>
  </div>
);

EventMap.defaultProps = {
  activeEvent: null,
  clickedEvents: [],
};

EventMap.propTypes = {
  activeEvent: PropTypes.shape(),
  clickedEvents: PropTypes.arrayOf(PropTypes.shape()),
  displayEventBox: PropTypes.func.isRequired,
  events: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default EventMap;
