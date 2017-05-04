/**
 * Created by Jerome on 17-04-27.
 */
import React, {Component} from 'react';
import {
    View,
    Animated,
    Dimensions,
    PanResponder // responds to What are we touching, what component, how is gesture changing?
  } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * Dimensions.get('window').width;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component {

  // automatically assigns defaultProps
  static defaultProps = {
    onSwipeRight: () => {}, // use as default if the function is not passed in props
    onSwipeLeft: () => {}
  };

  constructor(props) {
    super(props);

    // gets updated whenever we get the gesture
    const position = new Animated.ValueXY();

    const panResponder = PanResponder.create({

      // occurs anytime the user taps on the screen
      // if we return TRUE, it will tell that this
      // panResponser will be responsible to
      // to handle this event
      onStartShouldSetPanResponder: () => true,

      // callback anytime when the user drags
      // something
      // gesture contains pixel value
      onPanResponderMove: (event, gesture) => {
        // gesture.dx, gesture.dy gives us the gesture coordinates
        // we update the position object coming from the Animated
        // code
        position.setValue({x: gesture.dx, y:gesture.dy});
      },

      // callback when the user releases (let go)
      onPanResponderRelease: (event, gesture) => {
        // swipe to the right
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forceSwipe('right');
        }
        // swipe to the left
        else if(gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe('left');
        }
        else {
          this.resetPosition();
        }
      }
    });
    // weird but we assigns the panResponder to state
    // and not updated it, same thing for position
    this.state = { panResponder, position, index: 0 }; // same as {position: position}

  }

  forceSwipe(direction) {
    const factor = (direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH);
    // linear animation with timing
    Animated.timing(this.state.position, {
      toValue: {x:factor, y:0},
      duration: SWIPE_OUT_DURATION
    }).start( () => {
      // on animation completion
      this.onSwipeComplete(direction);
    });
  }

  onSwipeComplete(direction) {
    const {onSwipeLeft, onSwipeRight, data} = this.props;
    const item = data[this.state.index];

    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    // mutating the value of position (?) weird..
    this.state.position.setValue( {x:0, y:0} );
    // careful: we modify the value by recreating one in the state
    this.setState({index: this.state.index + 1});
  }

  resetPosition() {
    Animated.spring(this.state.position,
      {
        toValue: {x:0, y:0}
      }
    ).start();
  }

  getCardStyle() {
    // destruct
    const { position } = this.state;
    const rotate = position.x.interpolate({
      // associate the inputRange to the outputRange scale
      //inputRange: [-500, 0, 500], // careful with pixels!
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg', '120deg']
      // relates -500 pixels to -120 degrees
      // linearly to 500 pixel to 120 degrees
    });

    return {
      // ...  spread operator
      ...position.getLayout(),
      // let's add an interpolation operator
      transform: [{rotate }] // rotate: rotate
    }
  }

  renderCards() {

    // we there is no more cards to render
    if (this.state.index == this.props.data.length ) {
      return this.props.renderNoMoreCards()
    } else {
      return this.props.data.map( (item, i) => {
        // state.index is the current card
        // i is the current index of the collection
        if (i < this.state.index) {
          return null;
        }
        // if the current state.index (current displayed card)
        // is the current index in the collection than we should
        // render it.
        if (i === this.state.index) {
          return (
            <Animated.View
              key={item.id}
              // ... : spreading properties to the view
              // attach handler
              {...this.state.panResponder.panHandlers}
              // move it and rotate it (linear relation with x coordinate)
              // array of styles
              style={[this.getCardStyle(), styles.cardStyle]}
            >
              {this.props.renderCard(item)}
            </Animated.View>
          );
        }
        return (
          // wrapping a Animated.View inside a View
          // causes the card animation to flash
          // images are reloaded each time!
          // We change to Animated.View to stop the flashing
          <Animated.View
            key={item.id}
            // we're cascading the cards
            style={ [styles.cardStyle, {top: 10 * (i - this.state.index) } ] }
          >
            { this.props.renderCard(item) }
          </Animated.View>
        );
        // the reverse method is helpful to put the first card
        // on top of the stack (with position absolute conflicting)
      }).reverse();
    }
  }
  render() {
    return (

      <View>
        {this.renderCards()}
      </View>
    );
  }
}

const styles = {
  cardStyle: {
    // all cards are stacked (last card on top! not what we want)
    position: 'absolute',
    // left: 0, right: 0 : properties conflicting with animations
    width: SCREEN_WIDTH
  }
};

export default Deck;
