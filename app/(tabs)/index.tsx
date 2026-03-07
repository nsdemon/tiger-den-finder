import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Image, Modal, FlatList, StatusBar,
  StyleSheet, Dimensions, Platform, ActivityIndicator, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useListings } from "@/context/ListingsContext";
import { MIN_TOUCH_TARGET } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TYPE_FILTERS = ["All", "Apartment", "Condo", "Single Family", "Townhouse"];
const TABS = ["Overview", "Price History", "Amenities", "Food", "Reviews", "Message", "Contact"];
const PRO_TABS: string[] = []; // Everything free for now

// Generate fake price history based on current price
function generatePriceHistory(currentPrice: number) {
  const months = ["Sep '23","Oct '23","Nov '23","Dec '23","Jan '24","Feb '24","Mar '24","Apr '24","May '24","Jun '24","Jul '24","Aug '24","Sep '24","Oct '24","Nov '24","Dec '24","Jan '25","Feb '25","Mar '25"];
  let price = currentPrice * 0.88;
  return months.map((month) => {
    price = price + (Math.random() - 0.3) * (currentPrice * 0.03);
    price = Math.max(currentPrice * 0.80, Math.min(currentPrice * 1.05, price));
    return { month, price: Math.round(price) };
  });
}

export default function TigerDenFinder() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selected, setSelected] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [wishlist, setWishlist] = useState<number[]>([]);
  const isPro = true; // Everything free while building user base
  const [showPricing, setShowPricing] = useState(false);
  const [pricingTrigger, setPricingTrigger] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [showAlerts, setShowAlerts] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertMaxPrice, setAlertMaxPrice] = useState("1000");
  const [alertMinBeds, setAlertMinBeds] = useState("1");
  const [alertType, setAlertType] = useState("Any");
  const [alertSaved, setAlertSaved] = useState(false);

  // Use shared listings context
  const { listings, loading: apiLoading, error: apiError, usingLiveData, refresh: fetchListings } = useListings();
  const [brokenPhotos, setBrokenPhotos] = useState<Set<string>>(new Set());
  const getPhoto = (item: any) => {
    const idStr = String(item.id);
    if (brokenPhotos.has(idStr) || !item.photo) {
      const str = item.address || idStr;
      const hash = str.split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
      const photos = [
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=700&q=80",
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=700&q=80",
        "https://images.unsplash.com/photo-1592595896616-c37162298647?w=700&q=80",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=700&q=80",
        "https://images.unsplash.com/photo-1576941342680-a4c43b37de0e?w=700&q=80",
      ];
      return photos[hash % photos.length];
    }
    return item.photo;
  };
  const [reportsPurchased, setReportsPurchased] = useState<number[]>([]);
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [showTesterMenu, setShowTesterMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filtered = listings.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch =
      l.name.toLowerCase().includes(q) ||
      l.address.toLowerCase().includes(q) ||
      l.type.toLowerCase().includes(q) ||
      l.tags.some((t: string) => t.toLowerCase().includes(q)) ||
      l.distance.toLowerCase().includes(q);
    const matchType = typeFilter === "All" || l.type === typeFilter;
    return matchSearch && matchType;
  }).sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "distance") return parseFloat(a.distance) - parseFloat(b.distance);
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  const toggleWishlist = (id: number) => {
    setWishlist((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleTabPress = (tab: string) => {
    if (PRO_TABS.includes(tab) && !isPro) {
      setPricingTrigger(tab);
      setShowPricing(true);
      return;
    }
    setActiveTab(tab);
    setMessageSent(false);
  };

  const stars = (rating: number) => "★".repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? "½" : "") + "☆".repeat(5 - Math.ceil(rating));

  return (
    <SafeAreaView style={s.root} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0533" />

      {/* HEADER */}
      <View style={s.header}>
        <View style={s.headerLogo}>
          <View style={s.logoBox}>
            <Text style={s.logoEmoji}>🐯</Text>
          </View>
          <View style={s.logoTextWrap}>
            <Text style={s.logoTitle}>Tiger Den</Text>
            <Text style={s.logoSub}>F I N D E R</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <View style={s.proBadge}><Text style={s.proBadgeText}>🐯 FREE</Text></View>
          {/* 🔔 ALERTS BUTTON */}
          <TouchableOpacity style={[s.alertBtn, alerts.length > 0 && s.alertBtnActive]} onPress={() => setShowAlerts(true)}>
            <Text style={s.alertBtnEmoji}>🔔</Text>
            {alerts.length > 0 && <View style={s.alertDot}><Text style={s.alertDotText}>{alerts.length}</Text></View>}
          </TouchableOpacity>
          {/* 🐾 TIGER PAW FILTER BUTTON */}
          <TouchableOpacity
            style={[s.pawBtn, typeFilter !== "All" && s.pawBtnActive]}
            onPress={() => setShowFilterMenu(true)}
          >
            <Text style={s.pawEmoji}>🐾</Text>
            {typeFilter !== "All" && <View style={s.pawDot} />}
          </TouchableOpacity>
          <TouchableOpacity style={[s.wishlistBtn, wishlist.length > 0 && s.wishlistBtnActive]} onPress={() => setShowWishlist(true)}>
            <Text style={[s.wishlistBtnText, wishlist.length > 0 && s.wishlistBtnTextActive]}>
              ♥{wishlist.length > 0 ? ` ${wishlist.length}` : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SEARCH BAR */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search by name, address, type..."
          placeholderTextColor="#8070A0"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* SORT BAR */}
      <View style={s.sortBar}>
        <Text style={s.sortLabel}>Sort:</Text>
        {[["default","Default"],["price_asc","💰 Low→High"],["price_desc","💰 High→Low"],["distance","📍 Distance"],["rating","⭐ Rating"]].map(([val, label]) => (
          <TouchableOpacity key={val} style={[s.sortChip, sortBy === val && s.sortChipActive]} onPress={() => setSortBy(val)}>
            <Text style={[s.sortChipText, sortBy === val && s.sortChipTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIVE DATA BANNER */}
      {usingLiveData && (
        <View style={s.liveBanner}>
          <Text style={s.liveBannerText}>🟢 Live listings from RentCast · {listings.length} properties found</Text>
        </View>
      )}

      {/* API ERROR BANNER */}
      {!!apiError && (
        <View style={s.errorBanner}>
          <Text style={s.errorBannerText}>⚠️ {apiError}</Text>
        </View>
      )}

      {/* LOADING STATE */}
      {apiLoading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color="#FDD835" />
          <Text style={s.loadingText}>Loading live listings near LSU...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          numColumns={Platform.OS === "web" ? 2 : 1}
          key={Platform.OS === "web" ? "web-2col" : "native-1col"}
          contentContainerStyle={s.listContent}
          columnWrapperStyle={Platform.OS === "web" ? s.columnWrapper : undefined}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={apiLoading} onRefresh={fetchListings} tintColor="#FDD835" />}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Text style={s.emptyEmoji}>🔍</Text>
              <Text style={s.emptyText}>No listings found</Text>
              <Text style={s.emptySubText}>Try adjusting your search</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={[s.card, Platform.OS === "web" && s.cardWeb]} activeOpacity={0.9} onPress={() => { setSelected(item); setActiveTab("Overview"); setMessageSent(false); }}>
            {/* Photo */}
            <View style={s.cardPhotoWrap}>
              <Image
                source={{ uri: getPhoto(item) }}
                style={s.cardPhoto}
                resizeMode="cover"
                onError={() => setBrokenPhotos(prev => new Set([...prev, String(item.id)]))}
              />
              <View style={s.cardPhotoOverlay} />
              {/* Badges */}
              <View style={s.cardBadgeRow}>
                {!item.available && <View style={s.waitlistBadge}><Text style={s.waitlistText}>WAITLIST</Text></View>}
                {item.verified && <View style={s.verifiedBadge}><Text style={s.verifiedText}>✓ Verified</Text></View>}
              </View>
              {/* Heart */}
              <TouchableOpacity style={s.heartBtn} onPress={() => toggleWishlist(item.id)}>
                <Text style={[s.heartIcon, wishlist.includes(item.id) && s.heartIconActive]}>
                  {wishlist.includes(item.id) ? "♥" : "♡"}
                </Text>
              </TouchableOpacity>
              {/* Name overlay */}
              <View style={s.cardNameWrap}>
                <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>
                <View style={s.distancePill}><Text style={s.distancePillText}>{item.distance}</Text></View>
              </View>
            </View>

            {/* Card Body */}
            <View style={s.cardBody}>
              <View style={s.cardRow}>
                <Text style={s.cardAddress} numberOfLines={1}>📍 {item.address}</Text>
                <View style={s.cardPriceWrap}>
                  <Text style={s.cardPrice}>${item.price.toLocaleString()}</Text>
                  <Text style={s.cardPriceSub}>/mo</Text>
                </View>
              </View>

              <View style={s.cardStats}>
                <Text style={s.cardStat}>🛏 {item.beds} Bed</Text>
                <Text style={s.cardStat}>🚿 {item.baths} Bath</Text>
                <Text style={s.cardStat}>📐 {item.sqft} sqft</Text>
              </View>

              <View style={s.cardTagRow}>
                {item.tags.map((tag: string) => (
                  <View key={tag} style={s.tag}><Text style={s.tagText}>{tag}</Text></View>
                ))}
              </View>

              <View style={s.cardFooter}>
                <Text style={s.cardRating}>★ {item.rating.toFixed(1)} <Text style={s.cardReviews}>({item.reviews} reviews)</Text></Text>
              </View>
            </View>
          </TouchableOpacity>
          )}
        />
      )}

      {/* ── DETAIL MODAL ── */}
      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        <SafeAreaView style={s.root}>
          {selected && (
            <>
              {/* Hero Photo */}
              <View style={s.modalHero}>
                <Image source={{ uri: selected.photo }} style={s.modalHeroImg} resizeMode="cover" />
                <View style={s.modalHeroOverlay} />
                <TouchableOpacity style={s.modalCloseBtn} onPress={() => setSelected(null)}>
                  <Text style={s.modalCloseTxt}>✕</Text>
                </TouchableOpacity>
                <View style={s.modalHeroInfo}>
                  <View style={s.modalHeroBadges}>
                    {selected.verified && <View style={s.verifiedBadge}><Text style={s.verifiedText}>✓ Verified</Text></View>}
                    <Text style={selected.available ? s.availableText : s.waitlistText2}>{selected.available ? "✓ Available" : "⏳ Waitlist"}</Text>
                  </View>
                  <View style={s.modalHeroBottom}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.modalHeroName}>{selected.name}</Text>
                      <Text style={s.modalHeroAddr}>📍 {selected.address}</Text>
                    </View>
                    <View style={s.modalHeroPrice}>
                      <Text style={s.modalHeroPriceNum}>${selected.price.toLocaleString()}</Text>
                      <Text style={s.modalHeroPriceSub}>/mo</Text>
                    </View>
                  </View>
                  <View style={s.modalHeroStats}>
                    <Text style={s.modalHeroStat}>🛏 {selected.beds} Bed</Text>
                    <Text style={s.modalHeroStat}>🚿 {selected.baths} Bath</Text>
                    <Text style={s.modalHeroStat}>📐 {selected.sqft} sqft</Text>
                    <Text style={s.modalHeroStat}>★ {selected.rating}</Text>
                  </View>
                </View>
              </View>

              {/* Tabs */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabScroll} contentContainerStyle={s.tabContent}>
                {TABS.map((tab) => (
                  <TouchableOpacity key={tab} style={[s.tabBtn, activeTab === tab && s.tabBtnActive]} onPress={() => handleTabPress(tab)}>
                    <Text style={[s.tabBtnText, activeTab === tab && s.tabBtnTextActive]}>{tab}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Tab Content */}
              <ScrollView style={s.tabBody} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* OVERVIEW */}
                {activeTab === "Overview" && (
                  <View>
                    <Text style={s.sectionDesc}>{selected.description}</Text>
                    <View style={s.tagsRow}>
                      {selected.tags.map((t: string) => <View key={t} style={s.tagGold}><Text style={s.tagGoldText}>{t}</Text></View>)}
                    </View>
                    <View style={s.statsGrid}>
                      {[["Type", selected.type], ["Bedrooms", `${selected.beds} Bed`], ["Bathrooms", `${selected.baths} Bath`], ["Size", `${selected.sqft} sqft`], ["Rating", `★ ${selected.rating?.toFixed(1)}/5`], ["Reviews", `${selected.reviews} reviews`]].map(([k, v]) => (
                        <View key={k} style={s.statCell}>
                          <Text style={s.statLabel}>{k}</Text>
                          <Text style={s.statValue}>{v}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* PRICE HISTORY */}
                {activeTab === "Price History" && (
                  <View>
                    <Text style={s.sectionTitle}>📊 Price History</Text>
                    <Text style={s.sectionSubTitle}>Rent trend over the past 19 months</Text>
                    {(() => {
                      const history = generatePriceHistory(selected.price);
                      const min = Math.min(...history.map(h => h.price));
                      const max = Math.max(...history.map(h => h.price));
                      const range = max - min || 1;
                      const current = history[history.length - 1].price;
                      const first = history[0].price;
                      const change = current - first;
                      const pct = ((change / first) * 100).toFixed(1);
                      return (
                        <View>
                          <View style={s.priceStatRow}>
                            <View style={s.priceStat}>
                              <Text style={s.priceStatLabel}>Current</Text>
                              <Text style={s.priceStatValue}>${current.toLocaleString()}</Text>
                            </View>
                            <View style={s.priceStat}>
                              <Text style={s.priceStatLabel}>12mo Low</Text>
                              <Text style={s.priceStatValue}>${min.toLocaleString()}</Text>
                            </View>
                            <View style={s.priceStat}>
                              <Text style={s.priceStatLabel}>12mo High</Text>
                              <Text style={s.priceStatValue}>${max.toLocaleString()}</Text>
                            </View>
                            <View style={s.priceStat}>
                              <Text style={s.priceStatLabel}>Trend</Text>
                              <Text style={[s.priceStatValue, { color: change >= 0 ? "#F87171" : "#4ADE80" }]}>
                                {change >= 0 ? "▲" : "▼"} {Math.abs(parseFloat(pct))}%
                              </Text>
                            </View>
                          </View>
                          {/* Bar chart */}
                          <View style={s.chartWrap}>
                            {history.map((h, i) => {
                              const barH = 8 + ((h.price - min) / range) * 80;
                              const isLast = i === history.length - 1;
                              return (
                                <View key={i} style={s.chartBarWrap}>
                                  <View style={[s.chartBar, { height: barH, backgroundColor: isLast ? GOLD : "rgba(253,216,53,0.35)" }]} />
                                  {i % 4 === 0 && <Text style={s.chartLabel}>{h.month.split(" ")[0]}</Text>}
                                </View>
                              );
                            })}
                          </View>
                          <Text style={s.chartNote}>
                            {change >= 0
                              ? `⚠️ Rent has increased $${Math.abs(change)}/mo since ${history[0].month}. Consider negotiating.`
                              : `✅ Rent has decreased $${Math.abs(change)}/mo since ${history[0].month}. Good time to sign!`}
                          </Text>
                        </View>
                      );
                    })()}
                  </View>
                )}

                {/* AMENITIES */}
                {activeTab === "Amenities" && (
                  <View>
                    <Text style={s.sectionTitle}>🏠 Full Amenities</Text>
                    <Text style={s.sectionSubTitle}>Everything included with this property</Text>
                    <View style={s.amenitiesWrap}>
                      {selected.amenities.map((a: string) => (
                        <View key={a} style={s.amenityChip}><Text style={s.amenityChipText}>✓ {a}</Text></View>
                      ))}
                    </View>
                    {/* Standard amenities all properties have */}
                    <Text style={s.amenitiesCatLabel}>Standard</Text>
                    <View style={s.amenitiesWrap}>
                      {["Parking Available","Trash Pickup","24hr Maintenance","Online Rent Payment","Renters Insurance Required"].map(a => (
                        <View key={a} style={s.amenityChipGray}><Text style={s.amenityChipTextGray}>• {a}</Text></View>
                      ))}
                    </View>
                    <Text style={s.amenitiesCatLabel}>Utilities</Text>
                    <View style={s.amenitiesWrap}>
                      {["Water/Sewer","Electricity (not included)","Gas (not included)","Internet (varies)"].map(a => (
                        <View key={a} style={s.amenityChipGray}><Text style={s.amenityChipTextGray}>• {a}</Text></View>
                      ))}
                    </View>
                    <Text style={s.amenitiesCatLabel}>LSU Nearby</Text>
                    <View style={s.amenitiesWrap}>
                      {["Tiger Trails Bus Stop","Mike the Tiger Stadium","UREC Recreation Center","LSU Student Union"].map(a => (
                        <View key={a} style={s.amenityChipGray}><Text style={s.amenityChipTextGray}>📍 {a}</Text></View>
                      ))}
                    </View>
                  </View>
                )}

                {/* FOOD */}
                {activeTab === "Food" && (
                  <View>
                    <Text style={s.sectionTitle}>Nearby Eats</Text>
                    <Text style={s.sectionSubTitle}>Top spots within walking distance</Text>
                    {selected.nearbyFood.map((f: any) => (
                      <View key={f.name} style={s.foodRow}>
                        <Text style={s.foodEmoji}>{f.emoji}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={s.foodName}>{f.name}</Text>
                          <Text style={s.foodType}>{f.type}</Text>
                        </View>
                        <Text style={s.foodDist}>{f.distance}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* REVIEWS */}
                {activeTab === "Reviews" && (
                  <View>
                    <Text style={s.sectionTitle}>Student Reviews</Text>
                    <Text style={s.sectionSubTitle}>Real feedback from LSU students</Text>
                    {selected.studentReviews.map((r: any, i: number) => (
                      <View key={i} style={s.reviewCard}>
                        <View style={s.reviewHeader}>
                          <Text style={s.reviewName}>{r.name}</Text>
                          <View style={s.reviewMeta}>
                            <Text style={s.reviewStars}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</Text>
                            <Text style={s.reviewSem}>{r.semester}</Text>
                          </View>
                        </View>
                        <Text style={s.reviewText}>{r.text}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* MESSAGE */}
                {activeTab === "Message" && (
                  <View>
                    <Text style={s.sectionTitle}>Message Landlord</Text>
                    <Text style={s.sectionSubTitle}>Send a direct message to {selected.contact.name}</Text>
                    {messageSent ? (
                      <View style={s.successBox}>
                        <Text style={s.successEmoji}>✉️</Text>
                        <Text style={s.successTitle}>Message Sent!</Text>
                        <Text style={s.successSub}>You'll hear back within 24 hours.</Text>
                      </View>
                    ) : (
                      <View>
                        <View style={s.toBox}>
                          <Text style={s.toLabel}>TO</Text>
                          <Text style={s.toValue}>{selected.contact.name} · {selected.contact.email}</Text>
                        </View>
                        <TextInput
                          style={s.messageInput}
                          multiline
                          numberOfLines={6}
                          placeholder={`Hi, I'm an LSU student interested in ${selected.name}. Is a unit available for...`}
                          placeholderTextColor="#6050A0"
                          value={messageText}
                          onChangeText={setMessageText}
                        />
                        <TouchableOpacity
                          style={[s.sendBtn, !messageText.trim() && s.sendBtnDisabled]}
                          onPress={() => { if (messageText.trim()) { setMessageSent(true); setMessageText(""); } }}
                          disabled={!messageText.trim()}
                        >
                          <Text style={s.sendBtnText}>Send Message →</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {/* CONTACT */}
                {activeTab === "Contact" && (
                  <View>
                    <Text style={s.sectionTitle}>Contact Info</Text>
                    {[["👤", "Contact", selected.contact.name], ["📞", "Phone", selected.contact.phone], ["✉️", "Email", selected.contact.email], ["🕐", "Hours", selected.contact.hours]].map(([emoji, label, value]) => (
                      <View key={label} style={s.contactRow}>
                        <Text style={s.contactEmoji}>{emoji}</Text>
                        <View>
                          <Text style={s.contactLabel}>{label}</Text>
                          <Text style={s.contactValue}>{value}</Text>
                        </View>
                      </View>
                    ))}
                    <TouchableOpacity style={s.tourBtn}>
                      <Text style={s.tourBtnText}>📨 Schedule a Tour</Text>
                    </TouchableOpacity>
                  </View>
                )}

              </ScrollView>
            </>
          )}
        </SafeAreaView>
      </Modal>

      {/* ── ALERTS MODAL ── */}
      <Modal visible={showAlerts} animationType="slide" transparent onRequestClose={() => setShowAlerts(false)}>
        <View style={s.modalOverlay}>
          <View style={s.alertsBox}>
            <View style={s.alertsHeader}>
              <Text style={s.alertsTitle}>🔔 Listing Alerts</Text>
              <TouchableOpacity onPress={() => setShowAlerts(false)}>
                <Text style={s.alertsClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.alertsSub}>Get notified when new listings match your criteria</Text>

            <Text style={s.alertFieldLabel}>Max Price / month</Text>
            <TextInput
              style={s.alertInput}
              value={alertMaxPrice}
              onChangeText={setAlertMaxPrice}
              keyboardType="numeric"
              placeholder="e.g. 1000"
              placeholderTextColor="#8070A0"
            />

            <Text style={s.alertFieldLabel}>Min Bedrooms</Text>
            <View style={s.alertBedRow}>
              {["Any","1","2","3","4+"].map(b => (
                <TouchableOpacity key={b} style={[s.alertBedBtn, alertMinBeds === b && s.alertBedBtnActive]} onPress={() => setAlertMinBeds(b)}>
                  <Text style={[s.alertBedBtnText, alertMinBeds === b && s.alertBedBtnTextActive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.alertFieldLabel}>Property Type</Text>
            <View style={s.alertBedRow}>
              {["Any","Apartment","Condo","Single Family","Townhouse"].map(t => (
                <TouchableOpacity key={t} style={[s.alertBedBtn, alertType === t && s.alertBedBtnActive]} onPress={() => setAlertType(t)}>
                  <Text style={[s.alertBedBtnText, alertType === t && s.alertBedBtnTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {alertSaved ? (
              <View style={s.alertSuccessBox}>
                <Text style={s.alertSuccessText}>✅ Alert saved! We'll notify you when matching listings appear.</Text>
              </View>
            ) : (
              <TouchableOpacity style={s.alertSaveBtn} onPress={() => {
                setAlerts(prev => [...prev, { maxPrice: alertMaxPrice, minBeds: alertMinBeds, type: alertType, id: Date.now() }]);
                setAlertSaved(true);
                setTimeout(() => { setAlertSaved(false); setShowAlerts(false); }, 2000);
              }}>
                <Text style={s.alertSaveBtnText}>🔔 Save Alert</Text>
              </TouchableOpacity>
            )}

            {alerts.length > 0 && (
              <View style={s.savedAlertsList}>
                <Text style={s.savedAlertsTitle}>Your Active Alerts ({alerts.length})</Text>
                {alerts.map(a => (
                  <View key={a.id} style={s.savedAlertRow}>
                    <Text style={s.savedAlertText}>
                      Under ${a.maxPrice} · {a.minBeds} bed · {a.type}
                    </Text>
                    <TouchableOpacity onPress={() => setAlerts(prev => prev.filter(x => x.id !== a.id))}>
                      <Text style={s.savedAlertDelete}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ── WISHLIST MODAL ── */}
      <Modal visible={showWishlist} animationType="slide" onRequestClose={() => setShowWishlist(false)}>
        <SafeAreaView style={s.root}>
          <View style={s.wishlistHeader}>
            <Text style={s.wishlistTitle}>♥ Saved ({wishlist.length})</Text>
            <TouchableOpacity onPress={() => setShowWishlist(false)}>
              <Text style={s.wishlistClose}>✕</Text>
            </TouchableOpacity>
          </View>
          {wishlist.length === 0 ? (
            <View style={s.emptyWrap}>
              <Text style={s.emptyEmoji}>♡</Text>
              <Text style={s.emptyText}>No saved listings yet</Text>
              <Text style={s.emptySubText}>Heart a property to save it here</Text>
            </View>
          ) : (
            <FlatList
              data={listings.filter((l) => wishlist.includes(l.id))}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.wishCard} onPress={() => { setSelected(item); setShowWishlist(false); setActiveTab("Overview"); }}>
                  <Image source={{ uri: item.photo }} style={s.wishCardPhoto} resizeMode="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={s.wishCardName}>{item.name}</Text>
                    <Text style={s.wishCardPrice}>${item.price}/mo</Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleWishlist(item.id)}>
                    <Text style={s.wishCardRemove}>✕</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* ── 🐾 TIGER PAW FILTER MODAL ── */}
      <Modal visible={showFilterMenu} transparent animationType="fade" onRequestClose={() => setShowFilterMenu(false)}>
        <TouchableOpacity style={s.pawOverlay} activeOpacity={1} onPress={() => setShowFilterMenu(false)}>
          <View style={s.pawDropdown}>
            <View style={s.pawDropdownHeader}>
              <Text style={s.pawDropdownEmoji}>🐾</Text>
              <Text style={s.pawDropdownTitle}>Filter by Type</Text>
              <TouchableOpacity onPress={() => setShowFilterMenu(false)}>
                <Text style={s.pawDropdownClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {TYPE_FILTERS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[s.pawOption, typeFilter === t && s.pawOptionActive]}
                onPress={() => { setTypeFilter(t); setShowFilterMenu(false); }}
              >
                <Text style={[s.pawOptionText, typeFilter === t && s.pawOptionTextActive]}>
                  {t === "All" ? "🏠 All Types" :
                   t === "Apartment" ? "🏢 Apartment" :
                   t === "Condo" ? "🏙️ Condo" :
                   t === "Single Family" ? "🏡 Single Family" :
                   t === "Townhouse" ? "🏘️ Townhouse" : `🏠 ${t}`}
                </Text>
                {typeFilter === t && <Text style={s.pawCheckmark}>✓</Text>}
              </TouchableOpacity>
            ))}
            {typeFilter !== "All" && (
              <TouchableOpacity style={s.pawClearBtn} onPress={() => { setTypeFilter("All"); setShowFilterMenu(false); }}>
                <Text style={s.pawClearText}>Clear Filter</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── TESTER MENU MODAL ── */}
      <Modal visible={showTesterMenu} animationType="fade" transparent onRequestClose={() => setShowTesterMenu(false)}>
        <View style={s.modalOverlay}>
          <View style={s.reportBox}>
            <Text style={s.reportBoxEmoji}>🧪</Text>
            <Text style={s.reportBoxTitle}>Tester Mode</Text>
            <Text style={s.reportBoxName}>Toggle features for testing</Text>
            <TouchableOpacity style={s.testerOptBtn} onPress={() => { setWishlist([]); }}>
              <Text style={s.testerOptBtnText}>Clear Wishlist</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowTesterMenu(false)}>
              <Text style={s.reportCancelTxt}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const GOLD = "#FDD835";
const PURPLE_DARK = "#0D0A14";
const PURPLE_MED = "#13101C";
const PURPLE_LIGHT = "#2D0B6B";
const TEXT = "#F5F0E8";
const MUTED = "#8070A0";
const GOLD_DIM = "#C9B55A";

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: PURPLE_DARK },
  safeHeader: { backgroundColor: PURPLE_LIGHT },

  // HEADER
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: PURPLE_LIGHT, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: GOLD },
  headerLogo: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  logoBox: { width: 44, height: 44, backgroundColor: GOLD, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoEmoji: { fontSize: 26 },
  logoTextWrap: { flexDirection: "column", justifyContent: "center" },
  logoTitle: { fontSize: 22, fontWeight: "900", color: GOLD, includeFontPadding: false },
  logoSub: { fontSize: 10, letterSpacing: 4, color: GOLD_DIM, includeFontPadding: false, marginTop: 1 },
  headerRight: { flexDirection: "row", gap: 10, alignItems: "center", flexShrink: 0 },
  upgradeBtn: { backgroundColor: GOLD, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  upgradeBtnText: { color: "#1A0533", fontWeight: "800", fontSize: 13 },
  proBadge: { backgroundColor: GOLD, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  proBadgeText: { color: "#1A0533", fontWeight: "800", fontSize: 12 },
  wishlistBtn: { borderWidth: 1.5, borderColor: GOLD, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, minHeight: MIN_TOUCH_TARGET, justifyContent: "center" },
  wishlistBtnActive: { backgroundColor: GOLD },
  wishlistBtnText: { color: GOLD, fontWeight: "700", fontSize: 14 },
  wishlistBtnTextActive: { color: "#1A0533" },

  // SEARCH
  searchWrap: { flexDirection: "row", alignItems: "center", backgroundColor: PURPLE_MED, margin: 12, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: "rgba(253,216,53,0.3)" },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: TEXT, paddingVertical: 12, fontSize: Platform.OS === "web" ? 16 : 14 },

  // FILTERS
  filterRow: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  filterChip: { height: 36, paddingHorizontal: 16, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1.5, borderColor: "rgba(253,216,53,0.5)", justifyContent: "center", alignItems: "center" },
  filterChipActive: { backgroundColor: GOLD, borderColor: GOLD },
  filterChipText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600", lineHeight: 18 },
  filterChipTextActive: { color: "#1A0533", fontWeight: "800" },

  // FREE BANNER
  freeBanner: { backgroundColor: PURPLE_LIGHT, marginHorizontal: 12, marginTop: 8, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "rgba(253,216,53,0.2)" },
  freeBannerText: { color: GOLD_DIM, fontSize: 12 },
  freeBannerLink: { color: GOLD, fontWeight: "700" },

  // LIST
  listContent: { padding: 12, paddingBottom: 40 },
  columnWrapper: { gap: 12, marginBottom: 12 },

  // CARD
  card: { backgroundColor: PURPLE_MED, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(253,216,53,0.12)", marginBottom: 12 },
  cardWeb: { flex: 1, marginBottom: 0 },
  cardPhotoWrap: { position: "relative", width: "100%", height: 0, paddingBottom: "75%" as any, overflow: "hidden" },
  cardPhoto: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" } as any,
  cardPhotoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  cardBadgeRow: { position: "absolute", top: 10, left: 10, flexDirection: "row", gap: 6 },
  waitlistBadge: { backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  waitlistText: { color: "#FF6B6B", fontSize: 10, fontWeight: "700" },
  verifiedBadge: { backgroundColor: "#3B82F6", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  verifiedText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  heartBtn: { position: "absolute", top: 10, right: 10, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 22, width: Platform.OS === "ios" || Platform.OS === "web" ? MIN_TOUCH_TARGET : 34, height: Platform.OS === "ios" || Platform.OS === "web" ? MIN_TOUCH_TARGET : 34, alignItems: "center", justifyContent: "center" },
  heartIcon: { fontSize: 18, color: "#ccc" },
  heartIconActive: { color: GOLD },
  cardNameWrap: { position: "absolute", bottom: 10, left: 12, right: 12, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  cardName: { flex: 1, fontSize: 17, fontWeight: "800", color: "#fff", marginRight: 8, textShadowColor: "rgba(0,0,0,0.6)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  distancePill: { backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  distancePillText: { color: GOLD, fontSize: 11, fontWeight: "600" },
  cardBody: { padding: 14 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  cardAddress: { flex: 1, fontSize: 11, color: MUTED, marginRight: 8 },
  cardPriceWrap: { alignItems: "flex-end" },
  cardPrice: { fontSize: 22, fontWeight: "900", color: GOLD },
  cardPriceSub: { fontSize: 11, color: MUTED },
  cardStats: { flexDirection: "row", gap: 14, marginBottom: 10 },
  cardStat: { fontSize: 12, color: GOLD_DIM },
  cardTagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  tag: { backgroundColor: "rgba(93,0,193,0.3)", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(93,0,193,0.5)" },
  tagText: { color: GOLD_DIM, fontSize: 11, fontWeight: "600" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardRating: { fontSize: 13, color: GOLD, fontWeight: "700" },
  cardReviews: { color: MUTED, fontWeight: "400", fontSize: 11 },
  reportBtn: { borderWidth: 1, borderColor: "rgba(253,216,53,0.3)", borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  reportBtnText: { color: GOLD_DIM, fontSize: 11 },
  reportBtnDone: { color: "#4ADE80", fontSize: 11, fontWeight: "700" },

  // DETAIL MODAL
  modalHero: { position: "relative", height: 300 },
  modalHeroImg: { width: "100%", height: "100%" },
  modalHeroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  modalCloseBtn: { position: "absolute", top: 14, right: 14, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  modalCloseTxt: { color: "#fff", fontSize: 16 },
  modalHeroInfo: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16 },
  modalHeroBadges: { flexDirection: "row", gap: 8, marginBottom: 8, alignItems: "center" },
  availableText: { color: "#4ADE80", fontWeight: "700", fontSize: 12 },
  waitlistText2: { color: "#FF6B6B", fontWeight: "700", fontSize: 12 },
  modalHeroBottom: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8 },
  modalHeroName: { fontSize: 22, fontWeight: "900", color: GOLD, lineHeight: 26 },
  modalHeroAddr: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 3 },
  modalHeroPrice: { alignItems: "flex-end" },
  modalHeroPriceNum: { fontSize: 28, fontWeight: "900", color: GOLD },
  modalHeroPriceSub: { fontSize: 11, color: "rgba(255,255,255,0.5)" },
  modalHeroStats: { flexDirection: "row", gap: 14 },
  modalHeroStat: { fontSize: 12, color: "rgba(255,255,255,0.75)" },

  // TABS
  tabScroll: { backgroundColor: PURPLE_MED, borderBottomWidth: 1, borderBottomColor: "rgba(253,216,53,0.15)", maxHeight: 48 },
  tabContent: { paddingHorizontal: 12, alignItems: "center", gap: 6 },
  tabBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  tabBtnActive: { backgroundColor: GOLD },
  tabBtnText: { color: MUTED, fontSize: 12, fontWeight: "600" },
  tabBtnTextActive: { color: "#1A0533" },
  tabBody: { flex: 1, padding: 20, backgroundColor: PURPLE_DARK },

  // SECTION CONTENT
  sectionDesc: { color: GOLD_DIM, fontSize: 14, lineHeight: 22, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: GOLD, marginBottom: 6 },
  sectionSubTitle: { fontSize: 12, color: MUTED, marginBottom: 16 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  tagGold: { backgroundColor: "rgba(253,216,53,0.12)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(253,216,53,0.3)" },
  tagGoldText: { color: GOLD, fontSize: 13, fontWeight: "600" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statCell: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 12, width: (SCREEN_WIDTH - 60) / 2 },
  statLabel: { fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 },
  statValue: { fontSize: 14, fontWeight: "700", color: TEXT },

  // REPORT BANNER
  reportBanner: { backgroundColor: "rgba(253,216,53,0.06)", borderWidth: 1, borderColor: "rgba(253,216,53,0.3)", borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  reportBannerTitle: { color: GOLD, fontWeight: "700", fontSize: 14 },
  reportBannerSub: { color: MUTED, fontSize: 12, marginTop: 2 },
  reportBannerBtn: { backgroundColor: GOLD, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  reportBannerBtnText: { color: "#1A0533", fontWeight: "800", fontSize: 13 },
  reportSuccess: { backgroundColor: "rgba(74,222,128,0.08)", borderWidth: 1, borderColor: "rgba(74,222,128,0.3)", borderRadius: 12, padding: 14 },
  reportSuccessText: { color: "#4ADE80", fontSize: 13 },

  // AMENITIES
  amenitiesWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  amenityChip: { backgroundColor: "rgba(253,216,53,0.08)", borderWidth: 1, borderColor: "rgba(253,216,53,0.2)", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  amenityChipText: { color: GOLD_DIM, fontSize: 13 },

  // FOOD
  foodRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)" },
  foodEmoji: { fontSize: 26 },
  foodName: { color: TEXT, fontWeight: "600", fontSize: 14 },
  foodType: { color: MUTED, fontSize: 12 },
  foodDist: { color: GOLD, fontWeight: "700", fontSize: 13 },

  // REVIEWS
  reviewCard: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  reviewName: { color: TEXT, fontWeight: "700", fontSize: 14 },
  reviewMeta: { alignItems: "flex-end" },
  reviewStars: { color: GOLD, fontSize: 12 },
  reviewSem: { color: MUTED, fontSize: 11 },
  reviewText: { color: GOLD_DIM, fontSize: 13, lineHeight: 20 },

  // MESSAGE
  toBox: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 12, marginBottom: 12 },
  toLabel: { fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: "uppercase" },
  toValue: { color: TEXT, fontWeight: "600", fontSize: 13, marginTop: 3 },
  messageInput: { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(253,216,53,0.2)", borderRadius: 10, padding: 12, color: TEXT, fontSize: 14, height: 130, textAlignVertical: "top", marginBottom: 12 },
  sendBtn: { backgroundColor: GOLD, borderRadius: 12, padding: 14, alignItems: "center" },
  sendBtnDisabled: { backgroundColor: "rgba(253,216,53,0.2)" },
  sendBtnText: { color: "#1A0533", fontWeight: "800", fontSize: 15 },

  // SUCCESS
  successBox: { backgroundColor: "rgba(74,222,128,0.08)", borderWidth: 1, borderColor: "rgba(74,222,128,0.3)", borderRadius: 14, padding: 28, alignItems: "center" },
  successEmoji: { fontSize: 36, marginBottom: 10 },
  successTitle: { color: "#4ADE80", fontWeight: "800", fontSize: 18 },
  successSub: { color: MUTED, fontSize: 13, marginTop: 6 },

  // CONTACT
  contactRow: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 14, marginBottom: 10 },
  contactEmoji: { fontSize: 22 },
  contactLabel: { fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: "uppercase" },
  contactValue: { color: TEXT, fontWeight: "700", fontSize: 14, marginTop: 2 },
  tourBtn: { backgroundColor: GOLD, borderRadius: 12, padding: 14, alignItems: "center", marginTop: 10 },
  tourBtnText: { color: "#1A0533", fontWeight: "800", fontSize: 15 },

  // PRICING MODAL
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" },
  pricingBox: { backgroundColor: PURPLE_MED, borderRadius: 24, padding: 24, margin: 12, borderWidth: 1, borderColor: "rgba(253,216,53,0.25)", alignItems: "center" },
  pricingClose: { position: "absolute", top: 16, right: 16, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20, width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  pricingCloseTxt: { color: TEXT, fontSize: 15 },
  pricingEmoji: { fontSize: 32, marginBottom: 8 },
  triggerBadge: { backgroundColor: "rgba(255,159,64,0.12)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 10 },
  triggerBadgeTxt: { color: "#FF9F40", fontSize: 12 },
  pricingTitle: { fontSize: 22, fontWeight: "900", color: GOLD, marginBottom: 4 },
  pricingSub: { color: GOLD_DIM, fontSize: 13, marginBottom: 16 },
  billingToggle: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 24, padding: 4, marginBottom: 16, gap: 4 },
  billingOpt: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, flexDirection: "row", alignItems: "center" },
  billingOptActive: { backgroundColor: GOLD },
  billingOptTxt: { color: MUTED, fontWeight: "600", fontSize: 13 },
  billingOptTxtActive: { color: "#1A0533" },
  saveBadge: { backgroundColor: "#4ADE80", borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1, marginLeft: 4 },
  saveBadgeTxt: { color: "#052E16", fontSize: 9, fontWeight: "800" },
  plansRow: { flexDirection: "row", gap: 12, width: "100%" },
  planCard: { flex: 1, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 14, borderWidth: 2, borderColor: "rgba(255,255,255,0.1)" },
  planCardPro: { borderColor: GOLD, backgroundColor: "rgba(253,216,53,0.04)", position: "relative" },
  bestValueBadge: { position: "absolute", top: -12, right: 8, backgroundColor: GOLD, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  bestValueTxt: { color: "#1A0533", fontSize: 9, fontWeight: "800" },
  planLabel: { color: MUTED, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 },
  planLabelPro: { color: GOLD, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 },
  planPrice: { color: TEXT, fontSize: 26, fontWeight: "900", marginBottom: 2 },
  planPricePro: { color: GOLD, fontSize: 26, fontWeight: "900", marginBottom: 2 },
  planPriceSub: { color: MUTED, fontSize: 10, marginBottom: 10 },
  planFeatureOn: { color: GOLD_DIM, fontSize: 11, marginBottom: 5 },
  planFeatureOff: { color: "#4A3560", fontSize: 11, marginBottom: 5 },
  planFeatureOnPro: { color: TEXT, fontSize: 11, fontWeight: "600", marginBottom: 5 },
  getProBtn: { backgroundColor: GOLD, borderRadius: 10, padding: 10, alignItems: "center", marginTop: 12 },
  getProBtnTxt: { color: "#1A0533", fontWeight: "800", fontSize: 12 },
  pricingFooter: { color: MUTED, fontSize: 11, marginTop: 14, textAlign: "center" },

  // REPORT MODAL
  reportBox: { backgroundColor: PURPLE_MED, borderRadius: 20, padding: 24, margin: 24, borderWidth: 1, borderColor: "rgba(253,216,53,0.25)", alignItems: "center" },
  reportBoxEmoji: { fontSize: 36, marginBottom: 8 },
  reportBoxTitle: { fontSize: 20, fontWeight: "900", color: GOLD, marginBottom: 4 },
  reportBoxName: { color: MUTED, fontSize: 13, marginBottom: 16 },
  reportBoxFeature: { color: GOLD_DIM, fontSize: 13, marginBottom: 6, alignSelf: "flex-start" },
  reportPriceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", backgroundColor: "rgba(253,216,53,0.06)", borderWidth: 1, borderColor: "rgba(253,216,53,0.2)", borderRadius: 12, padding: 14, marginVertical: 14 },
  reportPriceLabel: { color: TEXT, fontWeight: "600", fontSize: 14 },
  reportPriceNum: { color: GOLD, fontSize: 22, fontWeight: "900" },
  buyReportBtn: { backgroundColor: GOLD, borderRadius: 12, padding: 14, width: "100%", alignItems: "center", marginBottom: 10 },
  buyReportBtnTxt: { color: "#1A0533", fontWeight: "800", fontSize: 15 },
  reportCancelTxt: { color: MUTED, fontSize: 13, padding: 8 },

  // WISHLIST MODAL
  wishlistHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(253,216,53,0.1)" },
  wishlistTitle: { fontSize: 20, fontWeight: "800", color: GOLD },
  wishlistClose: { color: MUTED, fontSize: 20 },
  wishCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: PURPLE_MED, borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: "rgba(253,216,53,0.1)" },
  wishCardPhoto: { width: 56, height: 56, borderRadius: 8 },
  wishCardName: { color: TEXT, fontWeight: "600", fontSize: 14 },
  wishCardPrice: { color: GOLD, fontWeight: "700", fontSize: 13 },
  wishCardRemove: { color: GOLD, fontSize: 18, padding: 4 },

  // EMPTY STATE
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: TEXT, fontSize: 20, fontWeight: "700" },
  emptySubText: { color: MUTED, fontSize: 14, marginTop: 6 },

  // SORT BAR
  sortBar: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 14, paddingVertical: 8, gap: 6, alignItems: "center" },
  sortLabel: { color: MUTED, fontSize: 12, fontWeight: "600", marginRight: 4 },
  sortChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, minHeight: MIN_TOUCH_TARGET, justifyContent: "center", backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  sortChipActive: { backgroundColor: GOLD, borderColor: GOLD },
  sortChipText: { color: MUTED, fontSize: 11, fontWeight: "600" },
  sortChipTextActive: { color: "#1A0533", fontWeight: "800" },

  // LIVE DATA BANNER
  liveBanner: { backgroundColor: "rgba(74,222,128,0.08)", marginHorizontal: 12, marginBottom: 6, borderRadius: 10, padding: 8, borderWidth: 1, borderColor: "rgba(74,222,128,0.3)" },
  liveBannerText: { color: "#4ADE80", fontSize: 11, textAlign: "center", fontWeight: "600" },
  errorBanner: { backgroundColor: "rgba(255,100,100,0.08)", marginHorizontal: 12, marginBottom: 6, borderRadius: 10, padding: 8, borderWidth: 1, borderColor: "rgba(255,100,100,0.3)" },
  errorBannerText: { color: "#FF6B6B", fontSize: 11, textAlign: "center" },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText: { color: MUTED, fontSize: 14 },

  // TESTER BANNER
  testerBanner: { backgroundColor: "rgba(74,222,128,0.08)", marginHorizontal: 12, marginBottom: 6, borderRadius: 10, padding: 8, borderWidth: 1, borderColor: "rgba(74,222,128,0.3)" },
  testerBannerText: { color: "#4ADE80", fontSize: 11, textAlign: "center", fontWeight: "600" },

  // TIGER PAW FILTER BUTTON
  pawBtn: { width: Platform.OS === "ios" || Platform.OS === "web" ? MIN_TOUCH_TARGET : 38, height: Platform.OS === "ios" || Platform.OS === "web" ? MIN_TOUCH_TARGET : 38, borderRadius: Platform.OS === "ios" || Platform.OS === "web" ? 22 : 19, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1.5, borderColor: "rgba(253,216,53,0.4)", alignItems: "center", justifyContent: "center", position: "relative" },
  pawBtnActive: { backgroundColor: "rgba(253,216,53,0.15)", borderColor: GOLD },
  pawEmoji: { fontSize: 18 },
  pawDot: { position: "absolute", top: 2, right: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD, borderWidth: 1.5, borderColor: PURPLE_LIGHT },

  // TIGER PAW DROPDOWN
  pawOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-start", alignItems: "flex-end", paddingTop: 100, paddingRight: 16 },
  pawDropdown: { backgroundColor: "#1A0F2E", borderRadius: 18, width: 240, borderWidth: 1.5, borderColor: "rgba(253,216,53,0.3)", overflow: "hidden" },
  pawDropdownHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "rgba(253,216,53,0.15)", backgroundColor: PURPLE_LIGHT },
  pawDropdownEmoji: { fontSize: 18 },
  pawDropdownTitle: { flex: 1, color: GOLD, fontWeight: "800", fontSize: 14 },
  pawDropdownClose: { color: MUTED, fontSize: 16, padding: 2 },
  pawOption: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  pawOptionActive: { backgroundColor: "rgba(253,216,53,0.08)" },
  pawOptionText: { color: TEXT, fontSize: 14, fontWeight: "500" },
  pawOptionTextActive: { color: GOLD, fontWeight: "700" },
  pawCheckmark: { color: GOLD, fontSize: 14, fontWeight: "800" },
  pawClearBtn: { margin: 12, backgroundColor: "rgba(255,100,100,0.1)", borderRadius: 10, padding: 10, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,100,100,0.25)" },
  pawClearText: { color: "#FF6B6B", fontWeight: "700", fontSize: 13 },

  // TESTER MODAL BUTTONS
  testerOptBtn: { backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 10, padding: 12, width: "100%", alignItems: "center", marginBottom: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  testerOptBtnActive: { backgroundColor: "rgba(74,222,128,0.15)", borderColor: "#4ADE80" },
  testerOptBtnText: { color: TEXT, fontSize: 13, fontWeight: "600" },

  // ALERTS BUTTON
  alertBtn: { width: Platform.OS === "ios" || Platform.OS === "web" ? MIN_TOUCH_TARGET : 36, height: Platform.OS === "ios" || Platform.OS === "web" ? MIN_TOUCH_TARGET : 36, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", position: "relative" },
  alertBtnActive: { backgroundColor: "rgba(253,216,53,0.15)", borderColor: GOLD },
  alertBtnEmoji: { fontSize: 16 },
  alertDot: { position: "absolute", top: -4, right: -4, backgroundColor: GOLD, borderRadius: 8, minWidth: 16, height: 16, alignItems: "center", justifyContent: "center" },
  alertDotText: { color: "#1A0533", fontSize: 9, fontWeight: "900" },

  // ALERTS MODAL
  alertsBox: { backgroundColor: "#1A0F2E", borderRadius: 24, padding: 24, width: "90%", maxWidth: 440, borderWidth: 1, borderColor: "rgba(253,216,53,0.2)" },
  alertsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  alertsTitle: { color: GOLD, fontSize: 20, fontWeight: "900" },
  alertsClose: { color: MUTED, fontSize: 20 },
  alertsSub: { color: MUTED, fontSize: 13, marginBottom: 20 },
  alertFieldLabel: { color: TEXT, fontSize: 13, fontWeight: "700", marginBottom: 8, marginTop: 12 },
  alertInput: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", color: TEXT, fontSize: 15, padding: 12, marginBottom: 4 },
  alertBedRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  alertBedBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  alertBedBtnActive: { backgroundColor: GOLD, borderColor: GOLD },
  alertBedBtnText: { color: MUTED, fontSize: 12, fontWeight: "600" },
  alertBedBtnTextActive: { color: "#1A0533", fontWeight: "800" },
  alertSaveBtn: { backgroundColor: GOLD, borderRadius: 12, padding: 14, alignItems: "center", marginTop: 20 },
  alertSaveBtnText: { color: "#1A0533", fontWeight: "900", fontSize: 15 },
  alertSuccessBox: { backgroundColor: "rgba(74,222,128,0.1)", borderRadius: 12, padding: 14, marginTop: 20, borderWidth: 1, borderColor: "rgba(74,222,128,0.3)" },
  alertSuccessText: { color: "#4ADE80", fontSize: 13, textAlign: "center", fontWeight: "600" },
  savedAlertsList: { marginTop: 20, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)", paddingTop: 16 },
  savedAlertsTitle: { color: MUTED, fontSize: 12, fontWeight: "700", marginBottom: 10 },
  savedAlertRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 10, marginBottom: 8 },
  savedAlertText: { color: TEXT, fontSize: 12 },
  savedAlertDelete: { color: "#F87171", fontSize: 16, paddingHorizontal: 6 },

  // PRICE HISTORY
  priceStatRow: { flexDirection: "row", gap: 8, marginBottom: 20, marginTop: 10 },
  priceStat: { flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 10, alignItems: "center" },
  priceStatLabel: { color: MUTED, fontSize: 10, marginBottom: 4 },
  priceStatValue: { color: TEXT, fontSize: 14, fontWeight: "800" },
  chartWrap: { flexDirection: "row", alignItems: "flex-end", height: 100, gap: 3, marginBottom: 8 },
  chartBarWrap: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  chartBar: { width: "100%", borderRadius: 3, minHeight: 8 },
  chartLabel: { color: MUTED, fontSize: 7, marginTop: 3 },
  chartNote: { color: MUTED, fontSize: 12, fontStyle: "italic", marginTop: 12, lineHeight: 18 },

  // AMENITIES EXPANDED
  amenitiesCatLabel: { color: GOLD, fontSize: 11, fontWeight: "800", marginTop: 16, marginBottom: 8, letterSpacing: 1 },
  amenityChipGray: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  amenityChipTextGray: { color: MUTED, fontSize: 12 },
});
