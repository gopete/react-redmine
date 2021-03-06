// @flow
"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Animated,
  Platform,
  StatusBar,
  TouchableOpacity,
  Keyboard,
  UIManager,
  findNodeHandle
} from "react-native";
import appConfig from "@src/app.json";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as issueActions from "@issues.redux/actions";

const styles = StyleSheet.create({
  title: {
    fontFamily: "Raleway-Bold",
    fontSize: 26,
    color: "#fff",
    left: 10
  },
  details: {
    fontFamily: "Raleway-Bold",
    fontSize: 10,
    color: "#fff",
    left: 10
  }
});

class CustomHeaderButton extends Component {
  render() {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={this.props.onPress}>
        <View style={[{ marginTop: 7, width: 30 }, this.props.style]}>
          <Icon
            title={this.props.title}
            size={30}
            name={this.props.name}
            style={this.props.iconStyle}
            color="#fff"
          />
        </View>
      </TouchableOpacity>
    );
  }
}

class PopupMenu extends Component {
  static propTypes = {
    // array of strings, will be list items of Menu
    actions: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      icon: null
    };
  }

  onError() {
    console.error("Popup Error");
  }

  onPress = () => {
    if (this.state.icon) {
      UIManager.showPopupMenu(
        findNodeHandle(this.state.icon),
        Object.keys(this.props.actions),
        this.onError,
        this.onPopupEvent
      );
    }
  };

  onPopupEvent = (eventName, index) => {
    if (eventName !== "itemSelected") return;

    var i = 0;
    for (let p in this.props.actions) {
      if (index == i) this.props.actions[p]();
      i++;
    }
  };

  render() {
    return (
      <CustomHeaderButton
        name="more-vert"
        title="More"
        style={{ marginRight: 5 }}
        onPress={this.onPress}
        ref={this.onRef}
      />
    );
  }

  onRef = icon => {
    if (!this.state.icon) {
      this.setState({ icon });
    }
  };
}

class HeaderTitle extends Component {
  state = {
    animateSearch: new Animated.Value(0),
    searchText: "",
    widthBar: 0
  };

  toggleSearchBar(e, forceClose) {
    const { animateSearch, searchBarVisible } = this.state;
    Animated.timing(animateSearch, {
      duration: 500,
      toValue: animateSearch.__getValue() == 0 && !forceClose ? 1 : 0
    }).start();
    if (forceClose) Keyboard.dismiss();
    else this.searchInput.focus();
  }

  _onLayout = e => {
    this.setState({ widthBar: e.nativeEvent.layout.width });
  };

  search = () => {
    if (Number.isInteger(parseInt(this.state.searchText.replace("#", "")))) {
      this.props.navigation.navigate("Issue", {
        issue_id: this.state.searchText.replace("#", ""),
        req: null,
        indexKey: 0
      });
      this.setState({ searchText: "" });
      this.toggleSearchBar(null, true);
    }
  };

  render() {
    const { title, details, navigation } = this.props;
    const { state } = navigation;

    const popupMenu = state.routes[state.index].params
      ? state.routes[state.index].params.popupMenu
      : null;
    console.log("TRACE HEADERTITLE", state.routes[state.index].params);

    return (
      <View
        onLayout={this._onLayout}
        style={{
          left: 0,
          right: 0,
          height: 56,
          top: 0,
          position: "absolute",
          flex: 1,
          marginTop: Platform.OS == "ios" ? 20 : 0
        }}
      >
        <StatusBar barStyle="light-content" backgroundColor="#7f1010" />

        <Animated.View
          style={{
            flexDirection: "row",
            left: 0,
            right: 0,
            height: 56,
            top: 0,
            zIndex: this.state.animateSearch.interpolate({
              inputRange: [0, 1],
              outputRange: [10000, 9999]
            }),
            position: "absolute",
            backgroundColor: appConfig.backgroundColor,
            flex: 1,
            paddingTop: 5,
            transform: [
              {
                rotateX: this.state.animateSearch.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "-180deg"]
                })
              }
            ]
          }}
        >
          <View>
            <CustomHeaderButton
              name="menu"
              title="Menu"
              style={{ marginLeft: 10 }}
              onPress={() => navigation.toggleDrawer()}
            />
          </View>
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.details}>{details}</Text>
          </View>
          <View
            style={{
              position: "absolute",
              right: 5,
              top: 5,
              flexDirection: "row"
            }}
          >
            <CustomHeaderButton
              name="search"
              title="Search"
              style={{ marginRight: 10 }}
              onPress={this.toggleSearchBar.bind(this)}
            />
            {popupMenu ? <PopupMenu actions={popupMenu} /> : null}
          </View>
        </Animated.View>
        <Animated.View
          style={{
            position: "absolute",
            zIndex: this.state.animateSearch.interpolate({
              inputRange: [0, 1],
              outputRange: [9999, 10000]
            }),
            top: 0,
            height: 56,
            left: 0,
            right: 0,
            backgroundColor: "#7f1010",
            paddingTop: 5,
            flexDirection: "row",
            flex: 1,
            transform: [
              {
                rotateX: this.state.animateSearch.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["180deg", "0deg"]
                })
              }
            ]
            // transform: [
            //   {
            //     rotateX: this.state.animateSearch.interpolate({
            //       inputRange: [0, 1],
            //       outputRange: ["90%", "180%"]
            //     })
            //   }
            // ]
          }}
        >
          <View>
            <CustomHeaderButton
              name="close"
              title="Close"
              style={{ marginLeft: 10 }}
              onPress={this.toggleSearchBar.bind(this, true)}
            />
          </View>
          <View style={{ flex: 1, paddingTop: 5, paddingLeft: 5 }}>
            <TextInput
              placeholder="Entrez votre recherche"
              returnKeyType="search"
              textAlignVertical="top"
              ref={input => {
                this.searchInput = input;
              }}
              onSubmitEditing={this.search}
              onChangeText={searchText => this.setState({ searchText })}
              value={this.state.searchText}
              style={{
                backgroundColor: "#fff",
                height: 35,
                color: "#333333",
                fontFamily: "Raleway-Bold",
                fontSize: 15,
                padding: 4,
                marginLeft: 5,
                paddingTop: 8,
                borderWidth: 0,
                width: "80%"
              }}
            />
          </View>
          <View style={{ position: "absolute", right: 5, top: 5 }}>
            <CustomHeaderButton
              name="search"
              title="Search"
              style={{ marginRight: 10 }}
              onPress={this.search}
            />
          </View>
        </Animated.View>
      </View>
    );
  }
}

HeaderTitle.propTypes = {
  title: PropTypes.string.isRequired,
  details: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
  home: state.home,
  common: state.common,
  issues: state.issues,
  nav: state.nav
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ ...issueActions }, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderTitle);
