// app/(tabs)/map.tsx
import { useMemo, useState } from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useListings } from "@/context/ListingsContext";

const GOLD = "#FDD835";
const PURPLE_DARK = "#0D0A14";
const PURPLE_LIGHT = "#2D0B6B";
const MUTED = "#8070A0";
const TEXT = "#F5F0E8";

const FILTERS = ["All", "Apartment", "Condo", "Single Family", "Townhouse"];

export default function MapScreen() {
  const { listings, loading } = useListings();
  const [activeFilter, setActiveFilter] = useState("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filtered = useMemo(() =>
    listings.filter(l => activeFilter === "All" || l.type === activeFilter),
    [listings, activeFilter]
  );

  const leafletHTML = useMemo(() => {
    const markers = filtered.map(l => ({
      lat: l.lat, lng: l.lng, name: l.name, price: l.price,
      beds: l.beds, baths: l.baths, type: l.type,
      distance: l.distance, available: l.available,
    }));

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map { width:100%; height:100%; background:#0D0A14; }
    .marker-pin { background:#2D0B6B; border:2px solid #FDD835; border-radius:12px; padding:3px 7px; color:#FDD835; font-weight:900; font-size:11px; font-family:sans-serif; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,0.5); cursor:pointer; }
    .marker-pin.unavailable { background:#374151; border-color:#6B7280; color:#9CA3AF; }
    .leaflet-popup-content-wrapper { background:#1A0F2E; border:1px solid rgba(253,216,53,0.3); border-radius:12px; color:#F5F0E8; }
    .leaflet-popup-tip { background:#1A0F2E; }
    .leaflet-popup-content { margin:12px 14px; min-width:180px; }
    .popup-name { color:#FDD835; font-weight:900; font-size:13px; margin-bottom:4px; }
    .popup-price { color:#FDD835; font-size:18px; font-weight:900; }
    .popup-price span { color:#8070A0; font-size:11px; font-weight:400; }
    .popup-meta { color:#8070A0; font-size:11px; margin-top:4px; }
    .popup-badge { display:inline-block; background:rgba(74,222,128,0.15); color:#4ADE80; font-size:9px; font-weight:700; padding:2px 6px; border-radius:6px; margin-top:4px; }
    .popup-badge.waitlist { background:rgba(107,114,128,0.15); color:#9CA3AF; }
    .leaflet-control-attribution { display:none !important; }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', { zoomControl:true }).setView([30.4133, -91.1800], 13);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom:19 }).addTo(map);
  var markers = ${JSON.stringify(markers)};
  markers.forEach(function(m) {
    var icon = L.divIcon({
      html: '<div class="marker-pin' + (m.available ? '' : ' unavailable') + '">$' + (m.price ? m.price.toLocaleString() : '?') + '</div>',
      className: '', iconAnchor: [20, 10],
    });
    var beds = m.beds === 0 ? 'Studio' : m.beds + ' Bed';
    var popup = '<div class="popup-name">' + m.name + '</div>'
      + '<div class="popup-price">$' + (m.price ? m.price.toLocaleString() : 'N/A') + '<span>/mo</span></div>'
      + '<div class="popup-meta">' + beds + ' · ' + m.baths + ' Bath · ' + m.type + '</div>'
      + '<div class="popup-meta">' + m.distance + '</div>'
      + '<div class="popup-badge' + (m.available ? '' : ' waitlist') + '">' + (m.available ? 'Available' : 'Waitlist') + '</div>';
    L.marker([m.lat, m.lng], { icon }).bindPopup(popup).addTo(map);
  });
</script>
</body>
</html>`;
  }, [filtered]);

  return (
    <SafeAreaView style={s.root} edges={["top", "left", "right"]}>
      {/* HEADER */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>🗺️ Map View</Text>
          <Text style={s.headerSub}>{loading ? "Loading..." : `${filtered.length} listings near LSU`}</Text>
        </View>
        {/* FILTER BUTTON */}
        <TouchableOpacity
          style={[s.filterBtn, activeFilter !== "All" && s.filterBtnActive]}
          onPress={() => setShowFilterMenu(true)}
        >
          <Text style={s.filterBtnEmoji}>🐾</Text>
          {activeFilter !== "All" && <View style={s.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* MAP */}
      <View style={s.mapContainer}>
        {Platform.OS === "web" && (
          <iframe srcDoc={leafletHTML} style={{ width: "100%", height: "100%", border: "none" } as any} />
        )}
      </View>

      {/* FILTER MENU MODAL */}
      <Modal visible={showFilterMenu} transparent animationType="fade" onRequestClose={() => setShowFilterMenu(false)}>
        <TouchableOpacity style={s.menuOverlay} activeOpacity={1} onPress={() => setShowFilterMenu(false)}>
          <View style={s.menuBox}>
            <Text style={s.menuTitle}>Property Type</Text>
            {FILTERS.map(f => (
              <TouchableOpacity
                key={f}
                style={[s.menuItem, activeFilter === f && s.menuItemActive]}
                onPress={() => { setActiveFilter(f); setShowFilterMenu(false); }}
              >
                <Text style={[s.menuItemText, activeFilter === f && s.menuItemTextActive]}>
                  {activeFilter === f ? "✓  " : "    "}{f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: PURPLE_DARK },
  header: { backgroundColor: PURPLE_LIGHT, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: GOLD, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { color: GOLD, fontSize: 22, fontWeight: "900" },
  headerSub: { color: MUTED, fontSize: 12, marginTop: 1 },
  filterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", position: "relative" },
  filterBtnActive: { backgroundColor: "rgba(253,216,53,0.15)", borderColor: GOLD },
  filterBtnEmoji: { fontSize: 18 },
  filterDot: { position: "absolute", top: -3, right: -3, width: 10, height: 10, borderRadius: 5, backgroundColor: GOLD },
  mapContainer: { flex: 1 },
  menuOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-start", alignItems: "flex-end", paddingTop: 100, paddingRight: 16 },
  menuBox: { backgroundColor: "#1A0F2E", borderRadius: 16, padding: 8, minWidth: 200, borderWidth: 1, borderColor: "rgba(253,216,53,0.2)", shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 20 },
  menuTitle: { color: MUTED, fontSize: 11, fontWeight: "700", paddingHorizontal: 14, paddingVertical: 8, letterSpacing: 1 },
  menuItem: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10 },
  menuItemActive: { backgroundColor: "rgba(253,216,53,0.12)" },
  menuItemText: { color: TEXT, fontSize: 14 },
  menuItemTextActive: { color: GOLD, fontWeight: "800" },
});
