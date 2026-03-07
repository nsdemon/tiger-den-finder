import { View, Text, TextInput, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSearch } from "@/context/SearchContext";
import { MIN_TOUCH_TARGET } from "@/constants/theme";

const GOLD = "#FDD835";
const PURPLE_DARK = "#0D0A14";
const PURPLE_MED = "#13101C";
const PURPLE_LIGHT = "#2D0B6B";
const TEXT = "#F5F0E8";
const MUTED = "#8070A0";

export default function SearchScreen() {
  const { searchQuery, setSearchQuery } = useSearch();

  return (
    <SafeAreaView style={s.root} edges={["top", "left", "right"]}>
      <View style={s.header}>
        <Text style={s.headerTitle}>🔍 Search</Text>
        <Text style={s.headerSub}>Name, address, type...</Text>
      </View>

      <View style={s.spacer} />

      <View style={s.bottomWrap}>
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search by name, address, type..."
            placeholderTextColor={MUTED}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
        <Text style={s.hint}>Matching listings appear on the Home tab.</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: PURPLE_DARK },
  header: {
    backgroundColor: PURPLE_LIGHT,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: GOLD,
  },
  headerTitle: { color: GOLD, fontSize: 26, fontWeight: "900" },
  headerSub: { color: MUTED, fontSize: 13, marginTop: 2 },
  spacer: { flex: 1 },
  bottomWrap: { padding: 16, paddingBottom: 24 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PURPLE_MED,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(253,216,53,0.3)",
  },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: {
    flex: 1,
    color: TEXT,
    paddingVertical: 14,
    fontSize: Platform.OS === "web" ? 16 : 16,
    minHeight: MIN_TOUCH_TARGET,
  },
  hint: { color: MUTED, fontSize: 12, marginTop: 12, textAlign: "center" },
});
