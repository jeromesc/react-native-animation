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

class Deck extends Component {
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
        this.resetPosition();
      }
    });
    // weird but we assigns the panResponder to state
    // and not updated it, same thing for position
    this.state = { panResponder, position }; // same as {position: position}

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
      inputRange: [-SCREEN_WIDTH * 2, 0, SCREEN_WIDTH * 2],
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
    return this.props.data.map( (item, index) => {
      // only first card
      if (index === 0) {
        return (
          <Animated.View
            key={item.id}
            // ... : spreading properties to the view
            {...this.state.panResponder.panHandlers}
            // move it and rotate it (linear relation with x coordinate)
            style={this.getCardStyle()}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        );
      }
      return this.props.renderCard(item);
    });
  }
  render() {
    return (

      <View>
        {this.renderCards()}
      </View>
    );
  }
}

export default Deck;
