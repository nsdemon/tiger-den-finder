import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { trackVisitStart } from "@/lib/analytics";
import { MIN_TOUCH_TARGET } from "@/constants/theme";

const CONSENT_KEY = "tigerden_cookie_consent";
const GOLD = "#FDD835";
const PURPLE_DARK = "#0D0A14";
const PURPLE_MED = "#13101C";
const TEXT = "#F5F0E8";
const MUTED = "#8070A0";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const consent = localStorage.getItem(CONSENT_KEY);
    if (consent !== "accepted" && consent !== "declined") setVisible(true);
  }, []);

  const accept = () => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(CONSENT_KEY, "accepted");
      trackVisitStart();
    }
    setVisible(false);
  };

  const decline = () => {
    if (typeof localStorage !== "undefined") localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible || Platform.OS !== "web") return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        <Text style={styles.text}>
          We use cookies to understand how visitors use our site (device, region, time on site). No personal data is sold.
        </Text>
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.declineBtn} onPress={decline}>
            <Text style={styles.declineText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptBtn} onPress={accept}>
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  bar: {
    maxWidth: 720,
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: PURPLE_MED,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(253,216,53,0.3)",
  },
  text: {
    flex: 1,
    minWidth: 200,
    color: TEXT,
    fontSize: 13,
    lineHeight: 18,
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  declineBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MUTED,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: "center",
  },
  declineText: { color: MUTED, fontSize: 14, fontWeight: "600" },
  acceptBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: GOLD,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: "center",
  },
  acceptText: { color: PURPLE_DARK, fontSize: 14, fontWeight: "800" },
});
