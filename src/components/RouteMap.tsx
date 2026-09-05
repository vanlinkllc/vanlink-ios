import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, type LatLng } from 'react-native-maps';
import { colors, radii } from '@/constants/theme';
import type { Job, RouteResult } from '@/lib/api';

interface Props {
  job: Job;
  routeResult?: RouteResult | null;
}

export const RouteMap: React.FC<Props> = ({ job, routeResult }) => {
  const pickup = toLatLng(job.pickupLat, job.pickupLng);
  const dropoff = toLatLng(job.dropoffLat, job.dropoffLng);
  const driver = toLatLng(job.driverLat, job.driverLng);
  const decodedPolyline = useMemo(
    () => decodePolyline(routeResult?.polyline),
    [routeResult?.polyline]
  );
  const coordinates = decodedPolyline.length > 0
    ? decodedPolyline
    : [pickup, dropoff].filter(Boolean) as LatLng[];

  if (!pickup || !dropoff) {
    return (
      <View style={styles.unavailableCard}>
        <Text style={styles.unavailableTitle}>Map unavailable</Text>
        <Text style={styles.unavailableText}>
          This job does not include pickup and destination coordinates from the backend.
        </Text>
      </View>
    );
  }

  const latitudes = [pickup.latitude, dropoff.latitude, driver?.latitude].filter(isNumber);
  const longitudes = [pickup.longitude, dropoff.longitude, driver?.longitude].filter(isNumber);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={styles.map}
      initialRegion={{
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max((maxLat - minLat) * 1.6, 0.04),
        longitudeDelta: Math.max((maxLng - minLng) * 1.6, 0.04),
      }}
    >
      <Marker coordinate={pickup} title="Pickup" description={job.pickupAddress} />
      <Marker coordinate={dropoff} title="Destination" description={job.dropoffAddress} />
      {driver ? (
        <Marker coordinate={driver} title="Driver location" pinColor={colors.primary} />
      ) : null}
      {coordinates.length >= 2 ? (
        <Polyline coordinates={coordinates} strokeColor={colors.primary} strokeWidth={4} />
      ) : null}
    </MapView>
  );
};

function toLatLng(lat?: number, lng?: number): LatLng | null {
  if (!isNumber(lat) || !isNumber(lng)) return null;
  return { latitude: lat, longitude: lng };
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function decodePolyline(polyline?: string): LatLng[] {
  if (!polyline) return [];
  const coordinates: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < polyline.length) {
    const latitudeResult = decodeNext(polyline, index);
    lat += latitudeResult.value;
    index = latitudeResult.nextIndex;

    const longitudeResult = decodeNext(polyline, index);
    lng += longitudeResult.value;
    index = longitudeResult.nextIndex;

    coordinates.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return coordinates;
}

function decodeNext(polyline: string, startIndex: number): { value: number; nextIndex: number } {
  let result = 0;
  let shift = 0;
  let index = startIndex;
  let byte = 0;

  do {
    byte = polyline.charCodeAt(index) - 63;
    index += 1;
    result |= (byte & 0x1f) << shift;
    shift += 5;
  } while (byte >= 0x20 && index < polyline.length);

  return {
    value: result & 1 ? ~(result >> 1) : result >> 1,
    nextIndex: index,
  };
}

const styles = StyleSheet.create({
  map: {
    height: 260,
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  unavailableCard: {
    backgroundColor: colors.warningBackground,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    padding: 14,
    gap: 6,
  },
  unavailableTitle: {
    color: colors.warningText,
    fontWeight: '800',
  },
  unavailableText: {
    color: colors.warningText,
    fontSize: 13,
    lineHeight: 18,
  },
});

