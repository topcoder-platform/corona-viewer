/*
 * Configuration Parameters
 */
export const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
export const GOOGLE_MAP_KEY = process.env.GOOGLE_MAP_KEY || 'AIzaSyCkA6FtiFlzkKGS5TpTcLSuaToH1xOa3uQ';

/*
 * App Constants and Working Parameters
 */
// max days back of events to display on the map
export const MAX_DAYS_BACK = 7;
// when clicked, duration an event box will appear before it fades away
export const CLICK_EVENT_FADE_TIME = 2000; // milliseconds
// when slider play forwards, duration an event box will appear before it fades away
export const SLIDER_EVENT_FADE_TIME = 1000; // milliseconds
// interval to cleanup expired events
export const EXPIRED_EVENTS_CLEAN_INTERVAL = 5000; // milliseconds
// Event types handled by the UI
export const ALLOWED_EVENT_TYPES = [
  'USER_REGISTRATION',
  'ADD_RESOURCE',
  'CONTEST SUBMISSION',
  'ACTIVATE_CHALLENGE',
];
// Event topics handled by the UI
export const ALLOWED_EVENT_TOPICS = [
  'notifications.autopilot.events',
];
// Event types that are explicitly not handled by the UI
export const IGNORED_EVENT_TYPES = [
  'UPDATE_DRAFT_CHALLENGE',
  'CLOSE_TASK',
];
