"use strict";
import React, { Component } from "react";
import PropTypes from "prop-types";
import createReactClass from "create-react-class";
import Icon from "react-native-vector-icons/FontAwesome";
import ImagePicker from "react-native-image-picker";

import {
  StyleSheet,
  TextInput,
  LayoutAnimation,
  Animated,
  Easing,
  Text,
  View,
  Platform,
  ViewPropTypes,
  TouchableOpacity
} from "react-native";

var textPropTypes = Text.propTypes || ViewPropTypes;
var textInputPropTypes = TextInput.propTypes || textPropTypes;
var propTypes = {
  ...textInputPropTypes,
  inputStyle: textInputPropTypes.style,
  labelStyle: textPropTypes.style,
  disabled: PropTypes.bool,
  style: ViewPropTypes.style
};

const imagePickerOptions = {
  title: "Ajouter une image",
  cancelButtonTitle: "Annuler",
  takePhotoButtonTitle: "Prendre une photo",
  chooseFromLibraryButtonTitle: "Choisir dans la galerie",
  storageOptions: {
    skipBackup: true,
    path: "images"
  }
};

var FloatingLabel = createReactClass({
  propTypes: propTypes,

  getInitialState() {
    var state = {
      text: this.props.value,
      dirty: this.props.value || this.props.placeholder
    };

    var style = state.dirty ? dirtyStyle : cleanStyle;
    state.labelStyle = {
      fontSize: new Animated.Value(style.fontSize),
      top: new Animated.Value(style.top)
    };

    return state;
  },

  componentWillReceiveProps(props) {
    if (typeof props.value !== "undefined" && props.value !== this.state.text) {
      this.setState({ text: props.value, dirty: !!props.value });
      this._animate(!!props.value);
    }
  },

  _animate(dirty) {
    var nextStyle = dirty ? dirtyStyle : cleanStyle;
    var labelStyle = this.state.labelStyle;
    var anims = Object.keys(nextStyle).map(prop => {
      return Animated.timing(
        labelStyle[prop],
        {
          toValue: nextStyle[prop],
          duration: 150
        },
        Easing.ease
      );
    });

    Animated.parallel(anims).start();
  },

  _onFocus() {
    this._animate(true);
    this.setState({ dirty: true });
    if (this.props.onFocus) {
      this.props.onFocus(arguments);
    }
  },

  _onBlur() {
    if (!this.state.text) {
      this._animate(false);
      this.setState({ dirty: false });
    }

    if (this.props.onBlur) {
      this.props.onBlur(arguments);
    }
  },

  onChangeText(text) {
    this.setState({ text });
    if (this.props.onChangeText) {
      this.props.onChangeText(text);
    }
  },

  updateText(event) {
    var text = event.nativeEvent.text;
    this.setState({ text });

    if (this.props.onEndEditing) {
      this.props.onEndEditing(event);
    }
  },

  _renderLabel() {
    return (
      <Animated.Text
        ref="label"
        style={[this.state.labelStyle, styles.label, this.props.labelStyle]}
      >
        {this.props.children}
      </Animated.Text>
    );
  },

  _showImagePicker() {
    ImagePicker.showImagePicker(imagePickerOptions, response => {
      console.log("Response = ", response);

      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.customButton) {
        console.log("User tapped custom button: ", response.customButton);
      } else {
        //const source = { uri: response.uri };

        // You can also display the image using data:
        const source = { uri: "data:image/jpeg;base64," + response.data };

        this.setState({
          imageSource: source
        });

        if (typeof this.props.onAddImage === "function")
          this.props.onAddImage(response);
      }
    });
  },

  render() {
    var props = {
        autoCapitalize: this.props.autoCapitalize,
        autoCorrect: this.props.autoCorrect,
        autoFocus: this.props.autoFocus,
        bufferDelay: this.props.bufferDelay,
        clearButtonMode: this.props.clearButtonMode,
        clearTextOnFocus: this.props.clearTextOnFocus,
        controlled: this.props.controlled,
        editable: this.props.editable,
        enablesReturnKeyAutomatically: this.props.enablesReturnKeyAutomatically,
        keyboardType: this.props.keyboardType,
        multiline: this.props.multiline,
        numberOfLines: this.props.numberOfLines,
        onBlur: this._onBlur,
        onChange: this.props.onChange,
        onChangeText: this.onChangeText,
        onEndEditing: this.updateText,
        onFocus: this._onFocus,
        onSubmitEditing: this.props.onSubmitEditing,
        password: this.props.secureTextEntry || this.props.password, // Compatibility
        placeholder: this.props.placeholder,
        secureTextEntry: this.props.secureTextEntry || this.props.password, // Compatibility
        returnKeyType: this.props.returnKeyType,
        selectTextOnFocus: this.props.selectTextOnFocus,
        selectionState: this.props.selectionState,
        style: [styles.input],
        testID: this.props.testID,
        value: this.state.text,
        underlineColorAndroid: this.props.underlineColorAndroid, // android TextInput will show the default bottom border
        onKeyPress: this.props.onKeyPress
      },
      elementStyles = [styles.element];

    if (this.props.inputStyle) {
      props.style.push(this.props.inputStyle);
    }

    if (this.props.style) {
      elementStyles.push(this.props.style);
    }

    return (
      <View style={elementStyles}>
        <View>
          {this._renderLabel()}
          {this.props.onAddImage ? (
            <TouchableOpacity
              style={iconStyleObj}
              onPress={this._showImagePicker}
            >
              <Icon name="image" color="#333" size={25} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TextInput {...props} />
      </View>
    );
  }
});

var labelStyleObj = {
  marginTop: 21,
  paddingLeft: 9,
  color: "#AAA",
  position: "absolute"
};

var iconStyleObj = {
  right: 10,
  marginTop: 15,
  position: "absolute",
  zIndex: 9999
};

if (Platform.OS === "web") {
  labelStyleObj.pointerEvents = "none";
}

var styles = StyleSheet.create({
  element: {
    position: "relative"
  },
  input: {
    borderColor: "gray",
    backgroundColor: "transparent",
    justifyContent: "center",
    borderWidth: 1,
    color: "black",
    fontSize: 18,
    borderRadius: 4,
    paddingLeft: 10,
    marginTop: 20
  },
  label: labelStyleObj
});

var cleanStyle = {
  fontSize: 18,
  top: 7
};

var dirtyStyle = {
  fontSize: 14,
  top: -17
};

module.exports = FloatingLabel;
