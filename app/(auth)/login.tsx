// app/(auth)/login.tsx
import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

const GOLD = "#FDD835";
const PURPLE_DARK = "#0D0A14";
const PURPLE_MED = "#13101C";
const PURPLE_LIGHT = "#2D0B6B";
const TEXT = "#F5F0E8";
const MUTED = "#8070A0";

export default function LoginScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSuccessMsg("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.replace("/");
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg("Account created! Check your email to confirm, then log in.");
        setMode("login");
      }
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email address first.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setError(error.message);
    } else {
      setSuccessMsg("Password reset link sent! Check your email.");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={s.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={s.logoWrap}>
            <View style={s.logoBox}>
              <Text style={s.logoEmoji}>🐯</Text>
            </View>
            <Text style={s.logoTitle}>Tiger Den</Text>
            <Text style={s.logoSub}>F I N D E R</Text>
            <Text style={s.logoTagline}>LSU Student Housing</Text>
          </View>

          {/* Card */}
          <View style={s.card}>
            {/* Mode Toggle */}
            <View style={s.modeToggle}>
              <TouchableOpacity
                style={[s.modeBtn, mode === "login" && s.modeBtnActive]}
                onPress={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
              >
                <Text style={[s.modeBtnText, mode === "login" && s.modeBtnTextActive]}>Log In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modeBtn, mode === "signup" && s.modeBtnActive]}
                onPress={() => { setMode("signup"); setError(""); setSuccessMsg(""); }}
              >
                <Text style={[s.modeBtnText, mode === "signup" && s.modeBtnTextActive]}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Error / Success */}
            {!!error && (
              <View style={s.errorBox}>
                <Text style={s.errorText}>⚠️ {error}</Text>
              </View>
            )}
            {!!successMsg && (
              <View style={s.successBox}>
                <Text style={s.successText}>✓ {successMsg}</Text>
              </View>
            )}

            {/* Email */}
            <Text style={s.label}>Email</Text>
            <TextInput
              style={s.input}
              placeholder="your@email.com"
              placeholderTextColor={MUTED}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {/* Password */}
            <Text style={s.label}>Password</Text>
            <TextInput
              style={s.input}
              placeholder={mode === "signup" ? "Create a password (min 6 chars)" : "Your password"}
              placeholderTextColor={MUTED}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Submit */}
            <TouchableOpacity
              style={[s.submitBtn, loading && s.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#1A0533" />
                : <Text style={s.submitBtnText}>{mode === "login" ? "Log In →" : "Create Account →"}</Text>
              }
            </TouchableOpacity>

            {/* Forgot password */}
            {mode === "login" && (
              <TouchableOpacity onPress={handleForgotPassword} style={s.forgotBtn}>
                <Text style={s.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Footer */}
          <Text style={s.footer}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <Text style={s.footerLink} onPress={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
              {mode === "login" ? "Sign up free" : "Log in"}
            </Text>
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: PURPLE_DARK },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },

  logoWrap: { alignItems: "center", marginBottom: 32 },
  logoBox: { width: 72, height: 72, backgroundColor: GOLD, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  logoEmoji: { fontSize: 40 },
  logoTitle: { fontSize: 32, fontWeight: "900", color: GOLD },
  logoSub: { fontSize: 12, letterSpacing: 6, color: "#C9B55A", marginTop: 2 },
  logoTagline: { fontSize: 13, color: MUTED, marginTop: 6 },

  card: { backgroundColor: PURPLE_MED, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "rgba(253,216,53,0.2)" },

  modeToggle: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 4, marginBottom: 20 },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  modeBtnActive: { backgroundColor: GOLD },
  modeBtnText: { color: MUTED, fontWeight: "700", fontSize: 14 },
  modeBtnTextActive: { color: "#1A0533" },

  errorBox: { backgroundColor: "rgba(255,100,100,0.1)", borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,100,100,0.3)" },
  errorText: { color: "#FF6B6B", fontSize: 13 },
  successBox: { backgroundColor: "rgba(74,222,128,0.08)", borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: "rgba(74,222,128,0.3)" },
  successText: { color: "#4ADE80", fontSize: 13 },

  label: { color: MUTED, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(253,216,53,0.2)", borderRadius: 12, padding: 14, color: TEXT, fontSize: 15 },

  submitBtn: { backgroundColor: GOLD, borderRadius: 14, padding: 16, alignItems: "center", marginTop: 20 },
  submitBtnDisabled: { backgroundColor: "rgba(253,216,53,0.3)" },
  submitBtnText: { color: "#1A0533", fontWeight: "900", fontSize: 16 },

  forgotBtn: { alignItems: "center", marginTop: 14 },
  forgotText: { color: MUTED, fontSize: 13 },

  footer: { color: MUTED, fontSize: 13, textAlign: "center", marginTop: 24 },
  footerLink: { color: GOLD, fontWeight: "700" },
});
