import { useEffect, useMemo, useState } from 'react';
import { httpHelper } from '../../../services/httpHelper.js';
import { getApiBaseUrl } from '../../../config/api/baseUrl.js';
import { resolveAuthIdentity } from '../../gameroom/utils/authIdentity.js';
import { DEFAULT_FILTERS, HISTORY_LIMIT } from '../logic/gameSessionHistory.utils.js';

export function useGameSessionHistory() {
  const [matches, setMatches] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState({ total: 0 });
  const [lastRefresh, setLastRefresh] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  const activeFilterCount = useMemo(
    () => Object.entries(filters).filter(([key, value]) => key !== 'sort' && value).length,
    [filters],
  );

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      const identity = await resolveAuthIdentity();
      const userId = identity.userId || identity.username || identity.email;
      if (isMounted) {
        setIsPremium(Boolean(identity?.isPremium || identity?.premiumStatus));
      }

      if (!userId) {
        if (isMounted) {
          setMatches([]);
          setPagination({ total: 0 });
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const queryParams = new URLSearchParams({
          userId,
          limit: String(HISTORY_LIMIT),
          sort: filters.sort,
        });
        if (identity.username) queryParams.set('username', identity.username);
        if (identity.email) queryParams.set('email', identity.email);
        if (filters.search.trim()) queryParams.set('search', filters.search.trim());
        if (filters.result) queryParams.set('result', filters.result);
        if (filters.gameType) queryParams.set('gameType', filters.gameType);
        if (filters.playerCount) queryParams.set('playerCount', filters.playerCount);
        if (filters.dateFrom) queryParams.set('dateFrom', filters.dateFrom);
        if (filters.dateTo) queryParams.set('dateTo', filters.dateTo);

        const response = await httpHelper.get(
          `${getApiBaseUrl()}/games/user/history?${queryParams.toString()}`
        );
        const historyData = response?.data?.data || {};
        if (!isMounted) return;

        setMatches(historyData.games || []);
        setPagination(historyData.pagination || { total: 0 });
        setLastRefresh(new Date());
      } catch (error) {
        if (isMounted) setErrorMessage(error?.message || 'Failed to load match history.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHistory();
    return () => { isMounted = false; };
  }, [filters]);

  return {
    matches, filters, pagination, lastRefresh, isLoading, errorMessage, isPremium,
    activeFilterCount, updateFilter, resetFilters,
  };
}

export default useGameSessionHistory;
