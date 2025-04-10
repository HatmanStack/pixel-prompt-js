import { StyleSheet, Switch, View, Text } from "react-native";


export default function SafteySwitch({
  settingSwitch,
  setSettingSwitch,
  setPlaySound
}) {
  const settingSwitchFunction = () => {
    setSettingSwitch(!settingSwitch);
    setPlaySound("switch");
  };

      
  return (
   
           
            <View style={styles.columnContainer}>
            <Switch
      trackColor={{ false: "#958DA5", true: "#767577" }}
      thumbColor="#B58392"
      activeThumbColor="#6750A4"
      ios_backgroundColor="#3e3e3e"
      onValueChange={settingSwitchFunction}
      value={settingSwitch}
    />
              <Text
                style={[
                  { color: settingSwitch ? "#9FA8DA" : "#FFFFFF" },
                  styles.sliderText,
                ]}
              >
                Saftey
              </Text>
              
            </View>
          
  );
}

const colors = {
  borderBottomColor: "#9DA58D",
  color: "#FFFFFF",
};
const styles = StyleSheet.create({
  dropdown: {
    margin: 16,
    height: 50,
    width: 340,
    borderBottomColor: colors.borderBottomColor,
    borderBottomWidth: 3,
  },
  placeholderStyle: {
    color: colors.color,
    fontSize: 25,
    fontFamily: "Sigmar",
    textAlign: "center",
    letterSpacing: 3,
  },
  columnContainer: {
    margin: 20,
    marginRight: 100,
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
  },
  sliderText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 2,
    lineHeight: 30,
    fontFamily: "Sigmar",
  },
 
  selectedTextStyle: {
    color: colors.color,
    fontSize: 20,
    fontFamily: "Sigmar",
    letterSpacing: 3,
    textAlign: "center",
  },
});
