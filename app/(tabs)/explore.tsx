import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GOLD = "#FDD835";
const PURPLE_DARK = "#0D0A14";
const PURPLE_MED = "#13101C";
const PURPLE_LIGHT = "#2D0B6B";
const TEXT = "#F5F0E8";
const MUTED = "#8070A0";
const GOLD_DIM = "#C9B55A";

const RESOURCES = [
  {
    category: "🏛️ On-Campus Housing",
    items: [
      { label: "LSU Residential Life", url: "https://www.lsu.edu/reslife/", desc: "Official LSU dorms & on-campus housing" },
      { label: "LSU Housing Portal", url: "https://lsu.starrezhousing.com/StarRezPortalX/Login", desc: "Apply for on-campus housing" },
      { label: "LSU Off-Campus Housing", url: "https://offcampushousing.lsu.edu/", desc: "LSU's official off-campus listings" },
    ],
  },
  {
    category: "📍 Neighborhood Guide",
    items: [
      { label: "Highland Road Area", url: "https://maps.google.com/?q=Highland+Road+Baton+Rouge", desc: "0.1–0.5 mi from campus • Most popular student area" },
      { label: "Nicholson Drive Area", url: "https://maps.google.com/?q=Nicholson+Drive+Baton+Rouge", desc: "On-campus adjacent • Quiet & convenient" },
      { label: "Perkins Road Area", url: "https://maps.google.com/?q=Perkins+Road+Baton+Rouge", desc: "1–2 mi from campus • Great food scene" },
      { label: "Downtown Baton Rouge", url: "https://maps.google.com/?q=Downtown+Baton+Rouge", desc: "3 mi from campus • Urban living" },
    ],
  },
  {
    category: "🚌 Transportation",
    items: [
      { label: "LSU Tiger Trails Bus", url: "https://www.lsu.edu/parking/bus/index.php", desc: "Free bus routes around campus & Baton Rouge" },
      { label: "CATS Bus System", url: "https://www.brcats.com/", desc: "Baton Rouge city buses" },
      { label: "LSU Campus Map", url: "https://www.lsu.edu/map/", desc: "Interactive campus map" },
    ],
  },
  {
    category: "💰 Financial Aid & Renter Help",
    items: [
      { label: "LSU Financial Aid", url: "https://www.lsu.edu/financialaid/", desc: "Scholarships, grants & housing assistance" },
      { label: "Louisiana Renter Rights", url: "https://ag.louisiana.gov/", desc: "Know your rights as a tenant in Louisiana" },
      { label: "Baton Rouge HUD", url: "https://www.hud.gov/states/louisiana", desc: "Federal housing assistance programs" },
    ],
  },
  {
    category: "🎓 Student Life",
    items: [
      { label: "LSU Student Organizations", url: "https://www.lsu.edu/campuslife/", desc: "Clubs, orgs & campus events" },
      { label: "LSU Dining", url: "https://lsudining.com/", desc: "Meal plans & dining locations on campus" },
      { label: "Reddit r/LSU", url: "https://www.reddit.com/r/LSU/", desc: "Student forum for housing tips & advice" },
    ],
  },
];

const TIPS = [
  { emoji: "📋", tip: "Sign a lease early — popular spots near LSU fill up by February for the fall semester." },
  { emoji: "🔍", tip: "Always tour in person before signing. Photos can be misleading." },
  { emoji: "💡", tip: "Ask about utility costs — some apartments don't include water, gas, or internet." },
  { emoji: "📍", tip: "Check the walk/bike distance to your specific college building, not just campus." },
  { emoji: "🤝", tip: "Get everything in writing — verbal promises from landlords aren't enforceable." },
  { emoji: "📸", tip: "Document the apartment condition with photos on move-in day to protect your deposit." },
];

export default function ExploreScreen() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <SafeAreaView style={s.root} edges={["top", "left", "right"]}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Explore</Text>
        <Text style={s.headerSub}>LSU Housing Resources</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* TIPS */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>💡 Student Housing Tips</Text>
          {TIPS.map((t, i) => (
            <View key={i} style={s.tipRow}>
              <Text style={s.tipEmoji}>{t.emoji}</Text>
              <Text style={s.tipText}>{t.tip}</Text>
            </View>
          ))}
        </View>

        {/* RESOURCES */}
        {RESOURCES.map((group) => (
          <View key={group.category} style={s.section}>
            <TouchableOpacity
              style={s.categoryHeader}
              onPress={() => setActiveSection(activeSection === group.category ? null : group.category)}
            >
              <Text style={s.sectionTitle}>{group.category}</Text>
              <Text style={s.chevron}>{activeSection === group.category ? "▲" : "▼"}</Text>
            </TouchableOpacity>

            {activeSection === group.category && group.items.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={s.resourceCard}
                onPress={() => Linking.openURL(item.url)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={s.resourceLabel}>{item.label}</Text>
                  <Text style={s.resourceDesc}>{item.desc}</Text>
                </View>
                <Text style={s.resourceArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* CONTACT */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📬 Contact Tiger Den</Text>
          <TouchableOpacity style={s.contactBtn} onPress={() => Linking.openURL("mailto:support@tigerdenfinderapp.com")}>
            <Text style={s.contactBtnText}>✉️  support@tigerdenfinderapp.com</Text>
          </TouchableOpacity>
          <Text style={s.versionText}>Tiger Den Finder v1.0 • Built for LSU 🐯</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: PURPLE_DARK },
  header: { backgroundColor: PURPLE_LIGHT, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 2, borderBottomColor: GOLD },
  headerTitle: { color: GOLD, fontSize: 26, fontWeight: "900" },
  headerSub: { color: MUTED, fontSize: 13, marginTop: 2 },

  section: { marginHorizontal: 14, marginTop: 18, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  categoryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { color: TEXT, fontSize: 15, fontWeight: "800", marginBottom: 12 },
  chevron: { color: GOLD, fontSize: 12 },

  tipRow: { flexDirection: "row", gap: 10, marginBottom: 12, alignItems: "flex-start" },
  tipEmoji: { fontSize: 18, marginTop: 1 },
  tipText: { color: MUTED, fontSize: 13, flex: 1, lineHeight: 20 },

  resourceCard: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "rgba(253,216,53,0.15)" },
  resourceLabel: { color: TEXT, fontWeight: "700", fontSize: 13, marginBottom: 2 },
  resourceDesc: { color: MUTED, fontSize: 11 },
  resourceArrow: { color: GOLD, fontSize: 18, marginLeft: 8 },

  contactBtn: { backgroundColor: "rgba(253,216,53,0.1)", borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "rgba(253,216,53,0.3)" },
  contactBtnText: { color: GOLD, fontWeight: "700", fontSize: 13 },
  versionText: { color: MUTED, fontSize: 11, textAlign: "center", marginTop: 12 },
});
