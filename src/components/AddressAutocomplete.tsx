import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TextInput } from '@/components/TextInput';
import { colors, radii } from '@/constants/theme';
import {
  fetchPlaceDetails,
  searchPlaces,
  type PlaceAutocompleteResult,
  type PlaceDetails,
} from '@/lib/api';

interface Props {
  label: string;
  value: string;
  selectedPlace: PlaceDetails | null;
  disabled?: boolean;
  onChangeText: (text: string) => void;
  onSelectPlace: (place: PlaceDetails) => void;
  onClearPlace: () => void;
}

export const AddressAutocomplete: React.FC<Props> = ({
  label,
  value,
  selectedPlace,
  disabled,
  onChangeText,
  onSelectPlace,
  onClearPlace,
}) => {
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<PlaceAutocompleteResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectingPlaceId, setSelectingPlaceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchedQuery, setSearchedQuery] = useState<string | null>(null);

  const shouldSearch = useMemo(
    () => focused && !selectedPlace && value.trim().length >= 2,
    [focused, selectedPlace, value]
  );

  useEffect(() => {
    if (!shouldSearch) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    const query = value.trim();
    setResults([]);
    setSearchedQuery(null);
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const places = await searchPlaces(query);
        if (active) {
          setResults(places);
          setSearchedQuery(query);
        }
      } catch (searchError) {
        if (active) {
          setResults([]);
          setError(
            searchError instanceof Error
              ? searchError.message
              : 'Unable to search addresses.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [retryCount, shouldSearch, value]);

  const handleTextChange = (text: string) => {
    onChangeText(text);
    if (selectedPlace) onClearPlace();
  };

  const handleSelect = async (result: PlaceAutocompleteResult) => {
    setSelectingPlaceId(result.placeId);
    setError(null);
    try {
      const place = await fetchPlaceDetails(result.placeId);
      onSelectPlace(place);
      setFocused(false);
      setResults([]);
    } catch (detailsError) {
      setError(
        detailsError instanceof Error
          ? detailsError.message
          : 'Unable to load address details.'
      );
    } finally {
      setSelectingPlaceId(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={handleTextChange}
        editable={!disabled}
        placeholder="Start typing an address"
        autoCapitalize="words"
        returnKeyType="search"
        onFocus={() => setFocused(true)}
      />
      {selectedPlace ? (
        <View style={styles.selectedCard}>
          <View style={styles.selectedCopy}>
            <Text style={styles.selectedTitle}>Selected address</Text>
            <Text style={styles.selectedText}>{selectedPlace.formattedAddress}</Text>
            {selectedPlace.eircode ? (
              <Text style={styles.metaText}>{selectedPlace.eircode}</Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => {
              onClearPlace();
              setFocused(true);
            }}
            disabled={disabled}
          >
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {focused && !selectedPlace && value.trim().length > 0 && value.trim().length < 2 ? (
        <Text style={styles.helperText}>Type at least 2 characters.</Text>
      ) : null}
      {loading ? (
        <View style={styles.stateRow}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.helperText}>Searching addresses...</Text>
        </View>
      ) : null}
      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setRetryCount(count => count + 1)}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {!loading && !error && shouldSearch && searchedQuery === value.trim() && results.length === 0 ? (
        <Text style={styles.helperText}>No addresses found.</Text>
      ) : null}
      {results.length > 0 ? (
        <View style={styles.resultsCard}>
          {results.map((result) => (
            <TouchableOpacity
              key={result.placeId}
              style={styles.resultRow}
              onPress={() => handleSelect(result)}
              disabled={disabled || Boolean(selectingPlaceId)}
            >
              <View style={styles.resultCopy}>
                <Text style={styles.resultPrimary}>{result.primaryText}</Text>
                <Text style={styles.resultSecondary}>
                  {result.secondaryText || result.description}
                </Text>
              </View>
              {selectingPlaceId === result.placeId ? (
                <ActivityIndicator color={colors.primary} />
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  selectedCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedCopy: {
    flex: 1,
    gap: 3,
  },
  selectedTitle: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '800',
  },
  selectedText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  metaText: {
    color: colors.mutedText,
    fontSize: 12,
  },
  changeButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  changeText: {
    color: colors.primary,
    fontWeight: '800',
  },
  stateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  helperText: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  errorCard: {
    backgroundColor: colors.dangerBackground,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    padding: 12,
    gap: 8,
  },
  errorText: {
    color: colors.dangerText,
    fontSize: 13,
    lineHeight: 18,
  },
  retryText: {
    color: colors.dangerText,
    fontWeight: '800',
  },
  resultsCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  resultRow: {
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  resultCopy: {
    flex: 1,
    gap: 3,
  },
  resultPrimary: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  resultSecondary: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
});
