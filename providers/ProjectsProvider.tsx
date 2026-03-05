import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Project, FilterState } from '@/types/project';
import { MOCK_PROJECTS } from '@/mocks/projects';

const PROJECTS_KEY = 'erasmus_projects';
const BOOKMARKS_KEY = 'erasmus_bookmarks';

export const [ProjectsProvider, useProjects] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PROJECTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Project[];
        if (parsed.length > 0) return parsed;
      }
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(MOCK_PROJECTS));
      return MOCK_PROJECTS;
    },
  });

  const bookmarksQuery = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(BOOKMARKS_KEY);
      return stored ? (JSON.parse(stored) as string[]) : [];
    },
  });

  useEffect(() => {
    if (projectsQuery.data) {
      setProjects(projectsQuery.data);
    }
  }, [projectsQuery.data]);

  useEffect(() => {
    if (bookmarksQuery.data) {
      setBookmarkedIds(new Set(bookmarksQuery.data));
    }
  }, [bookmarksQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (updated: Project[]) => {
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(ids));
      return ids;
    },
  });

  const { mutate: saveProjects } = saveMutation;
  const { mutate: saveBookmarks } = bookmarkMutation;

  const addProject = useCallback((project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newProject, ...projects];
    setProjects(updated);
    saveProjects(updated);
    console.log('Project added:', newProject.title);
  }, [projects, saveProjects]);

  const toggleBookmark = useCallback((projectId: string) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      saveBookmarks(Array.from(next));
      return next;
    });
  }, [saveBookmarks]);

  const isBookmarked = useCallback((projectId: string) => {
    return bookmarkedIds.has(projectId);
  }, [bookmarkedIds]);

  const getProjectById = useCallback((id: string) => {
    return projects.find(p => p.id === id) ?? null;
  }, [projects]);

  const bookmarkedProjects = useMemo(() => {
    return projects.filter(p => bookmarkedIds.has(p.id));
  }, [projects, bookmarkedIds]);

  return {
    projects,
    isLoading: projectsQuery.isLoading,
    addProject,
    toggleBookmark,
    isBookmarked,
    getProjectById,
    bookmarkedProjects,
  };
});

export function useFilteredProjects(filters: FilterState) {
  const { projects } = useProjects();

  return useMemo(() => {
    return projects.filter(project => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesSearch =
          project.title.toLowerCase().includes(q) ||
          project.ngoName.toLowerCase().includes(q) ||
          project.city.toLowerCase().includes(q) ||
          project.topics.some(t => t.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }
      if (filters.year && project.year !== filters.year) return false;
      if (filters.destinationCountry && project.destinationCountry !== filters.destinationCountry) return false;
      if (filters.residenceCountry && !project.eligibleCountries.includes(filters.residenceCountry)) return false;
      if (filters.type && project.type !== filters.type) return false;
      return true;
    });
  }, [projects, filters]);
}
