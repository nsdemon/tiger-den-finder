// app/(tabs)/account.tsx
import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";

const GOLD = "#FDD835";
const PURPLE_DARK = "#0D0A14";
const PURPLE_LIGHT = "#2D0B6B";
const TEXT = "#F5F0E8";
const MUTED = "#8070A0";

export default function AccountScreen() {
  const { session } = useAuth();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleFeedback = () => {
    if (!feedbackText.trim()) return;
    // In future: send to Supabase or email
    setFeedbackSent(true);
    setTimeout(() => { setFeedbackSent(false); setFeedbackText(""); setShowFeedback(false); }, 2000);
  };

  return (
    <SafeAreaView style={s.root} edges={["top", "left", "right"]}>
      <View style={s.header}>
        <Text style={s.headerTitle}>👤 Account</Text>
        <Text style={s.headerSub}>Tiger Den Finder</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* HERO */}
        <View style={s.heroCard}>
          <Text style={s.heroEmoji}>🐯</Text>
          <Text style={s.heroTitle}>Tiger Den Finder</Text>
          <Text style={s.heroSub}>The best way to find housing near LSU</Text>
          <View style={s.freeBadge}>
            <Text style={s.freeBadgeText}>✓ 100% Free Right Now</Text>
          </View>
        </View>

        {/* AVAILABLE NOW */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>✓ Available Now</Text>
          <TouchableOpacity style={s.featureRow} onPress={() => router.push("/(auth)/login")}>
            <Text style={s.featureEmoji}>👤</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.featureTitle}>Student Accounts</Text>
              <Text style={s.featureDesc}>
                {session ? "You're signed in." : "Sign in to save your preferences across devices."}
              </Text>
            </View>
            <View style={[s.badge, session && s.badgeSuccess]}>
              <Text style={[s.badgeText, session && s.badgeTextSuccess]}>{session ? "Signed in" : "Sign in"}</Text>
            </View>
          </TouchableOpacity>
          <View style={s.featureRow}>
            <Text style={s.featureEmoji}>🔔</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.featureTitle}>Listing Alerts</Text>
              <Text style={s.featureDesc}>Tap ⋯ on Home to set max price, beds & type. We'll remember your criteria.</Text>
            </View>
            <View style={s.badge}>
              <Text style={s.badgeText}>In app</Text>
            </View>
          </View>
          <View style={s.featureRow}>
            <Text style={s.featureEmoji}>💬</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.featureTitle}>Message Landlords</Text>
              <Text style={s.featureDesc}>Open any listing, then tap the Message tab to send a note.</Text>
            </View>
            <View style={s.badge}>
              <Text style={s.badgeText}>In app</Text>
            </View>
          </View>
        </View>

        {/* COMING SOON */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🚀 Coming Soon</Text>
          {[
            ["⭐", "Verified Reviews", "Rate & review properties you've lived in"],
            ["🏠", "Landlord Listings", "List your property and reach LSU students"],
          ].map(([emoji, title, desc]) => (
            <View key={title} style={s.featureRow}>
              <Text style={s.featureEmoji}>{emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.featureTitle}>{title}</Text>
                <Text style={s.featureDesc}>{desc}</Text>
              </View>
              <View style={s.comingSoonBadge}>
                <Text style={s.comingSoonText}>Soon</Text>
              </View>
            </View>
          ))}
        </View>

        {/* FEEDBACK */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>💬 Give Us Feedback</Text>
          <Text style={s.sectionDesc}>Help us build the features you actually want</Text>
          <TouchableOpacity style={s.feedbackBtn} onPress={() => setShowFeedback(true)}>
            <Text style={s.feedbackBtnText}>✏️  Share Your Thoughts</Text>
          </TouchableOpacity>
        </View>

        {/* ABOUT */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📬 About & Contact</Text>
          {[
            { label: "Email Us", value: "sudopc@gmail.com", action: () => Linking.openURL("mailto:sudopc@gmail.com") },
            { label: "Report a Bug", value: "Let us know what's broken", action: () => setShowFeedback(true) },
          ].map(item => (
            <TouchableOpacity key={item.label} style={s.contactRow} onPress={item.action}>
              <View style={{ flex: 1 }}>
                <Text style={s.contactLabel}>{item.label}</Text>
                <Text style={s.contactValue}>{item.value}</Text>
              </View>
              <Text style={s.contactArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* STATS */}
        <View style={s.statsRow}>
          {[["100+", "Listings"], ["Free", "Always"], ["LSU", "Focused"]].map(([val, label]) => (
            <View key={label} style={s.statBox}>
              <Text style={s.statVal}>{val}</Text>
              <Text style={s.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <Text style={s.footer}>Tiger Den Finder v1.0 • Built for LSU 🐯{"\n"}Baton Rouge, Louisiana</Text>
      </ScrollView>

      {/* FEEDBACK MODAL */}
      <Modal visible={showFeedback} transparent animationType="slide" onRequestClose={() => setShowFeedback(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Share Feedback</Text>
              <TouchableOpacity onPress={() => setShowFeedback(false)}>
                <Text style={s.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.modalSub}>What would make Tiger Den better for you?</Text>
            {feedbackSent ? (
              <View style={s.successBox}>
                <Text style={s.successText}>✅ Thanks! We'll review your feedback.</Text>
              </View>
            ) : (
              <>
                <TextInput
                  style={s.feedbackInput}
                  value={feedbackText}
                  onChangeText={setFeedbackText}
                  placeholder="e.g. I wish I could filter by distance from campus..."
                  placeholderTextColor="#8070A0"
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
                <TouchableOpacity style={s.submitBtn} onPress={handleFeedback}>
                  <Text style={s.submitBtnText}>Send Feedback →</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.emailAltBtn} onPress={() => Linking.openURL(`mailto:sudopc@gmail.com?subject=Tiger Den Feedback&body=${encodeURIComponent(feedbackText)}`)}>
                  <Text style={s.emailAltText}>Or send via email →</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: PURPLE_DARK },
  header: { backgroundColor: PURPLE_LIGHT, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 2, borderBottomColor: GOLD },
  headerTitle: { color: GOLD, fontSize: 26, fontWeight: "900" },
  headerSub: { color: MUTED, fontSize: 12, marginTop: 2 },

  heroCard: { margin: 14, backgroundColor: PURPLE_LIGHT, borderRadius: 20, padding: 28, alignItems: "center", borderWidth: 1, borderColor: "rgba(253,216,53,0.3)" },
  heroEmoji: { fontSize: 52, marginBottom: 10 },
  heroTitle: { color: GOLD, fontSize: 24, fontWeight: "900", marginBottom: 6 },
  heroSub: { color: TEXT, fontSize: 14, textAlign: "center", marginBottom: 16, opacity: 0.8 },
  freeBadge: { backgroundColor: "rgba(74,222,128,0.15)", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(74,222,128,0.3)" },
  freeBadgeText: { color: "#4ADE80", fontWeight: "800", fontSize: 13 },

  section: { marginHorizontal: 14, marginTop: 14, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  sectionTitle: { color: TEXT, fontSize: 15, fontWeight: "800", marginBottom: 6 },
  sectionDesc: { color: MUTED, fontSize: 13, marginBottom: 14 },

  featureRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)" },
  featureEmoji: { fontSize: 22, width: 32, textAlign: "center" },
  featureTitle: { color: TEXT, fontWeight: "700", fontSize: 13, marginBottom: 2 },
  featureDesc: { color: MUTED, fontSize: 11, lineHeight: 16 },
  comingSoonBadge: { backgroundColor: "rgba(253,216,53,0.1)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(253,216,53,0.2)" },
  comingSoonText: { color: GOLD, fontSize: 9, fontWeight: "800" },
  badge: { backgroundColor: "rgba(74,222,128,0.15)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(74,222,128,0.3)" },
  badgeSuccess: { backgroundColor: "rgba(74,222,128,0.25)" },
  badgeText: { color: "#4ADE80", fontSize: 10, fontWeight: "800" },
  badgeTextSuccess: { color: "#4ADE80" },

  feedbackBtn: { backgroundColor: "rgba(253,216,53,0.1)", borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "rgba(253,216,53,0.25)" },
  feedbackBtnText: { color: GOLD, fontWeight: "700", fontSize: 14 },

  contactRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  contactLabel: { color: TEXT, fontWeight: "700", fontSize: 13, marginBottom: 2 },
  contactValue: { color: MUTED, fontSize: 12 },
  contactArrow: { color: GOLD, fontSize: 18 },

  statsRow: { flexDirection: "row", gap: 10, marginHorizontal: 14, marginTop: 14 },
  statBox: { flex: 1, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  statVal: { color: GOLD, fontSize: 22, fontWeight: "900", marginBottom: 4 },
  statLabel: { color: MUTED, fontSize: 11 },

  footer: { color: MUTED, fontSize: 11, textAlign: "center", marginTop: 24, marginHorizontal: 14, lineHeight: 18 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalBox: { backgroundColor: "#1A0F2E", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: "rgba(253,216,53,0.2)" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  modalTitle: { color: GOLD, fontSize: 20, fontWeight: "900" },
  modalClose: { color: MUTED, fontSize: 22 },
  modalSub: { color: MUTED, fontSize: 13, marginBottom: 16 },
  feedbackInput: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", color: TEXT, fontSize: 14, padding: 14, minHeight: 120, marginBottom: 12 },
  submitBtn: { backgroundColor: GOLD, borderRadius: 12, padding: 14, alignItems: "center", marginBottom: 10 },
  submitBtnText: { color: "#1A0533", fontWeight: "900", fontSize: 15 },
  emailAltBtn: { alignItems: "center", padding: 8 },
  emailAltText: { color: MUTED, fontSize: 12 },
  successBox: { backgroundColor: "rgba(74,222,128,0.1)", borderRadius: 12, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "rgba(74,222,128,0.3)" },
  successText: { color: "#4ADE80", fontWeight: "700", fontSize: 14 },
});
