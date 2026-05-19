import { Repository } from "@/types";
import { GITHUB_API_URL } from "./constants";

export async function fetchRepositories(): Promise<Repository[]> {
  const response = await fetch(GITHUB_API_URL, {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return data
    .filter((repo: Repository) => !repo.fork)
    .map((repo: Repository) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      html_url: repo.html_url,
      description: repo.description,
      fork: repo.fork,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
      visibility: repo.visibility,
      topics: repo.topics || [],
      homepage: repo.homepage,
    }));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function getUniqueLanguages(repos: Repository[]): string[] {
  const languages = repos
    .map((repo) => repo.language)
    .filter((lang): lang is string => lang !== null);
  return [...new Set(languages)].sort();
}
