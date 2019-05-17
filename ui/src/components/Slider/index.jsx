import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { getMinDate } from 'helper/index';
import styles from './styles.scss';

/**
 * The slider component. User can drag to rewind/forward.
 */
class Slider extends React.Component {
  /**
   * Constructor.
   * @param {Object} props the component properties
   */
  constructor(props) {
    super(props);

    this.$el = React.createRef();

    this.startDrag = this.startDrag.bind(this);
    this.endDrag = this.endDrag.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.calcDragTimestamp = this.calcDragTimestamp.bind(this);
  }

  /**
   * Called when component unmount.
   */
  componentWillUnmount() {
    this.endDrag();
  }

  /**
   * On drag event.
   * @param {Event} mouseEvent the mouse event
   */
  onDrag(mouseEvent) {
    const { onDrag } = this.props;
    onDrag(this.calcDragTimestamp(mouseEvent));
  }

  /**
   * Start drag.
   */
  startDrag() {
    const { onDragStart } = this.props;
    onDragStart();

    window.addEventListener('mousemove', this.onDrag);
    window.addEventListener('mouseup', this.endDrag);
  }

  /**
   * End drag.
   * @param {Event} mouseEvent the mouse event
   */
  endDrag(mouseEvent) {
    const { onDragEnd } = this.props;
    onDragEnd(this.calcDragTimestamp(mouseEvent));

    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('mouseup', this.endDrag);
  }

  /**
   * Calculate drag timestamp.
   * @param {Event} mouseEvent the mouse event
   * @returns {Number} the drag timestamp
   */
  calcDragTimestamp(mouseEvent) {
    const mouseX = mouseEvent.pageX;
    const rect = this.$el.current.getBoundingClientRect();
    const scrollX = (window.pageXOffset !== undefined)
      ? window.pageXOffset
      : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
    let dLeft = mouseX - (rect.left + scrollX);
    dLeft = Math.max(dLeft, 0);
    dLeft = Math.min(dLeft, rect.width);

    const percent = dLeft / rect.width;

    const min = getMinDate();
    return Number((min + (Date.now() - min) * percent).toFixed(0));
  }

  /**
   * Render component.
   * @returns {Object} rendered component
   */
  render() {
    let { sliderTimestamp } = this.props;
    const min = getMinDate();
    if (sliderTimestamp < min) {
      sliderTimestamp = min;
    }

    const width = ((sliderTimestamp - min) * 100 / (Date.now() - min)).toFixed(2);

    return (
      <div
        className={styles.Slider}
        ref={this.$el}
        onMouseDown={this.startDrag}
      >
        <div style={{ width: `${width}%` }} className={styles.progress} />
        <div style={{ left: `${width}%` }} className={styles.handle} />
        <div style={{ left: `calc(calc(${width}%) - 50px)` }} className={styles.time}>{moment(sliderTimestamp).format('MM/DD/YYYY HH:mm')}</div>
      </div>
    );
  }
}

Slider.defaultProps = {
  sliderTimestamp: 0,
};

Slider.propTypes = {
  sliderTimestamp: PropTypes.number,
  onDrag: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
};

export default Slider;
