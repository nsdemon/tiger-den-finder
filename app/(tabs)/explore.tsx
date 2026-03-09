import { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 10;
const CARD_SIZE = (SCREEN_WIDTH - 14 * 2 - CARD_GAP) / 2;

const GOLD = "#FDD835";
const PURPLE_DARK = "#0D0A14";
const PURPLE_MED = "#13101C";
const PURPLE_LIGHT = "#2D0B6B";
const TEXT = "#F5F0E8";
const MUTED = "#8070A0";
const GOLD_DIM = "#C9B55A";

const EVENTS_RAW = [
  { id: "e1", title: "LSU Football vs Alabama", date: "2025-11-15T18:30", location: "Tiger Stadium", desc: "SEC matchup" },
  { id: "e2", title: "Mid City Makers Market", date: "2025-10-12T10:00", location: "Mid City", desc: "Local vendors & food" },
  { id: "e3", title: "Live After Five", date: "2025-10-03T17:00", location: "Downtown BR", desc: "Free outdoor concert" },
  { id: "e4", title: "LSU Basketball Opener", date: "2025-11-10T19:00", location: "PMAC", desc: "Season tip-off" },
  { id: "e5", title: "Red Stick Revelry", date: "2025-12-31T21:00", location: "Downtown", desc: "New Year's Eve" },
  { id: "e6", title: "Tigerland Block Party", date: "2025-10-18T14:00", location: "Tigerland", desc: "Student fest" },
  { id: "e7", title: "Free Speech Alley Fair", date: "2025-09-26T11:00", location: "LSU Campus", desc: "Orgs & giveaways" },
  { id: "e8", title: "LSU Lakes Yoga", date: "2025-10-05T08:00", location: "LSU Lakes", desc: "Free community yoga" },
];

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
      { label: "LSU Tiger Trails Bus", url: "https://lapop.lsu.edu/parking/transportation/tiger-trails.php", desc: "Free bus routes around campus & Baton Rouge" },
      { label: "CATS Bus System", url: "https://www.brcats.com/", desc: "Baton Rouge city buses" },
      { label: "LSU Campus Map", url: "https://map.lsu.edu/", desc: "Interactive campus map" },
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
      { label: "LSU Dining", url: "https://dineoncampus.com/lsu", desc: "Meal plans & dining locations on campus" },
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

function formatEventDate(iso: string) {
  const d = new Date(iso);
  const mon = d.toLocaleDateString("en-US", { month: "short" });
  const day = d.getDate();
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return { line1: `${mon} ${day}`, line2: time };
}

export default function ExploreScreen() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const eventsSorted = useMemo(
    () => [...EVENTS_RAW].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    []
  );

  return (
    <SafeAreaView style={s.root} edges={["top", "left", "right"]}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Explore</Text>
        <Text style={s.headerSub}>Events & LSU Resources</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* EVENTS — square cards, 2-column grid, soonest first */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🎉 Upcoming Events</Text>
          <View style={s.eventsGrid}>
            {eventsSorted.map((ev) => {
              const { line1, line2 } = formatEventDate(ev.date);
              return (
                <TouchableOpacity key={ev.id} style={s.eventCard} onPress={() => {}} activeOpacity={0.85}>
                  <View style={s.eventCardDateWrap}>
                    <Text style={s.eventCardDate1}>{line1}</Text>
                    <Text style={s.eventCardDate2}>{line2}</Text>
                  </View>
                  <Text style={s.eventCardTitle} numberOfLines={2}>{ev.title}</Text>
                  <Text style={s.eventCardLocation} numberOfLines={1}>📍 {ev.location}</Text>
                  <Text style={s.eventCardDesc} numberOfLines={1}>{ev.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

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
          <TouchableOpacity style={s.contactBtn} onPress={() => Linking.openURL("mailto:sudopc@gmail.com")}>
            <Text style={s.contactBtnText}>✉️  sudopc@gmail.com</Text>
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

  eventsGrid: { flexDirection: "row", flexWrap: "wrap", gap: CARD_GAP },
  eventCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(253,216,53,0.2)",
    justifyContent: "space-between",
  },
  eventCardDateWrap: { marginBottom: 4 },
  eventCardDate1: { color: GOLD, fontSize: 12, fontWeight: "800" },
  eventCardDate2: { color: MUTED, fontSize: 10, marginTop: 0 },
  eventCardTitle: { color: TEXT, fontSize: 12, fontWeight: "700", flex: 1 },
  eventCardLocation: { color: MUTED, fontSize: 10, marginTop: 2 },
  eventCardDesc: { color: GOLD_DIM, fontSize: 10, marginTop: 2 },
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
