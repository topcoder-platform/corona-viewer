/*
 * Configuration Parameters
 */
export const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
export const GOOGLE_MAP_KEY = process.env.GOOGLE_MAP_KEY || 'AIzaSyCkA6FtiFlzkKGS5TpTcLSuaToH1xOa3uQ';

/*
 * App Constants and Working Parameters
 */
// max number of events to display on the map
export const MAX_EVENT_COUNT = 10;
// when clicked, duration an event box will appear before it fades away
export const EVENT_FADE_TIME = 2000; // milliseconds
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
