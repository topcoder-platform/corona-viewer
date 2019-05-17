import React from 'react';
import PropTypes from 'prop-types';
import GoogleMapReact from 'google-map-react';
import EventDot from 'components/EventDot';
import EventBox from 'components/EventBox';
import { GOOGLE_MAP_KEY } from 'config/index';
import mapStyles from './mapstyles.json';

/**
 * Check whether event location is clicked.
 * @param {Object} eventLoc event location
 * @param {Array} events displayed events
 * @return true if event location is clicked, false otherwise
 */
const isClicked = (eventLoc, events) => {
  const filtered = events.filter(e => e.location === eventLoc.location);
  if (filtered.length > 0) {
    return true;
  }
  return false;
};

/**
 * Check whether dom element is in fullscreen mode.
 * @param {HTMLElement} element dom element
 * @return true if element is in fullscreen mode, false otherwise
 */
const isFullscreen = element => (document.fullscreenElement
  || document.webkitFullscreenElement
  || document.mozFullScreenElement
  || document.msFullscreenElement) === element;

/**
 * Request fullscreen mode.
 * @param {HTMLElement} element dom element to request fullscreen
 */
const requestFullscreen = (element) => {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.msRequestFullScreen) {
    element.msRequestFullScreen();
  }
};

/**
 * Exist fullscreen mode.
 */
const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.msCancelFullScreen) {
    document.msCancelFullScreen();
  }
};

/**
 * Handle on goolge maps api loaded.
 * @param {Object} map the google map
 * @param {Object} maps the google maps api
 */
const onGoogleApiLoaded = (map, maps) => {
  const fullscreenControl = document.querySelector('.gm-fullscreen-control');
  if (!fullscreenControl) {
    setTimeout(() => onGoogleApiLoaded(map, maps), 100);
    return;
  }
  maps.event.clearInstanceListeners(fullscreenControl, 'click');
  maps.event.addDomListener(fullscreenControl, 'click', () => {
    if (isFullscreen(document.body)) {
      exitFullscreen();
    } else {
      requestFullscreen(document.body);
    }
  });
};

const EventMap = ({
  eventLocs,
  activeEvents,
  clickedEvents,
  displayEventBox,
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
      defaultZoom={2.5}
      options={{ styles: mapStyles, minZoom: 1 }}
      disableDefaultUI
      yesIWantToUseGoogleMapApiInternals
      onGoogleApiLoaded={({ map, maps }) => onGoogleApiLoaded(map, maps)}
    >
      {
        eventLocs.map(eventLoc => (
          <EventDot
            key={eventLoc.location}
            lat={eventLoc.lat}
            lng={eventLoc.lng}
            active={
              isClicked(eventLoc, clickedEvents)
              || isClicked(eventLoc, activeEvents)
            }
            displayEventBox={displayEventBox}
            eventLoc={eventLoc}
          />
        ))
      }
      {
        activeEvents.map(event => (
          <EventBox
            key={event.uuid}
            lat={event.lat}
            lng={event.lng}
            event={event}
          />
        ))
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
  activeEvents: [],
  clickedEvents: [],
};

EventMap.propTypes = {
  activeEvents: PropTypes.arrayOf(PropTypes.shape()),
  clickedEvents: PropTypes.arrayOf(PropTypes.shape()),
  displayEventBox: PropTypes.func.isRequired,
  eventLocs: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default EventMap;
