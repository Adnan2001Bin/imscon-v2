import { Link } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About LUB Connect</Text>
      <Text style={styles.description}>
        LUB Connect is India&apos;s Manufacturing Future platform, bringing together
        industry leaders and innovators.
      </Text>
      <TouchableOpacity style={styles.button}>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Back to Home</Text>
        </Link>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fef2f2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#11181C',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#18181B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  link: {
    textDecorationLine: 'none',
  },
  linkText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});
