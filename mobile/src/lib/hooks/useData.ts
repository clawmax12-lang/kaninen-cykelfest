import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api/api';
import {
  useAppStore,
  Phase,
  Team,
  NewsItem,
  Video,
  Poll,
  Score,
  TeamArrival,
} from '@/lib/state/store';

export function useData() {
  const setPhases = useAppStore((s) => s.setPhases);
  const setTeams = useAppStore((s) => s.setTeams);
  const setNews = useAppStore((s) => s.setNews);
  const setVideos = useAppStore((s) => s.setVideos);
  const setPolls = useAppStore((s) => s.setPolls);
  const setScores = useAppStore((s) => s.setScores);
  const setArrivals = useAppStore((s) => s.setArrivals);
  const setSettings = useAppStore((s) => s.setSettings);
  const setLoading = useAppStore((s) => s.setLoading);
  const isLoading = useAppStore((s) => s.isLoading);
  const setLastFetched = useAppStore((s) => s.setLastFetched);
  const lastFetched = useAppStore((s) => s.lastFetched);

  const [error, setError] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [phases, teams, news, videos, polls, scores, arrivals, settings] =
        await Promise.all([
          api.get<Phase[]>('/api/cykelfest/phases').catch(() => null),
          api.get<Team[]>('/api/cykelfest/teams').catch(() => null),
          api.get<NewsItem[]>('/api/cykelfest/news').catch(() => null),
          api.get<Video[]>('/api/cykelfest/videos').catch(() => null),
          api.get<Poll[]>('/api/cykelfest/polls').catch(() => null),
          api.get<Score[]>('/api/cykelfest/scores').catch(() => null),
          api.get<TeamArrival[]>('/api/cykelfest/arrivals').catch(() => null),
          api.get<Record<string, string>>('/api/cykelfest/settings').catch(() => null),
        ]);
      // If all calls returned null, treat as an error
      if (!phases && !teams && !news && !videos && !polls && !scores && !arrivals && !settings) {
        setError(true);
      } else {
        if (phases) setPhases(phases);
        if (teams) setTeams(teams);
        if (news) setNews(news);
        if (videos) setVideos(videos);
        if (polls) setPolls(polls);
        if (scores) setScores(scores);
        if (arrivals) setArrivals(arrivals);
        if (settings) setSettings(settings);
        setLastFetched(Date.now());
      }
    } catch (e) {
      console.error('Fetch error:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [
    setPhases,
    setTeams,
    setNews,
    setVideos,
    setPolls,
    setScores,
    setArrivals,
    setSettings,
    setLoading,
    setLastFetched,
  ]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return { fetchAll, isLoading, error, refetch: fetchAll, lastFetched };
}
