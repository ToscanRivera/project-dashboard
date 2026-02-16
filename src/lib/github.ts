/**
 * GitHub API integration layer
 * Handles GitHub Project #1 and PR management
 */

export interface GitHubProject {
  id: string;
  title: string;
  body: string;
  status: string;
  repository?: string;
  description?: string;
}

export interface GitHubPR {
  number: number;
  title: string;
  state: 'open' | 'closed';
  user: {
    login: string;
  };
  created_at: string;
  files_changed?: number;
  review_status: 'none' | 'requested' | 'approved' | 'merged';
}

export interface GitHubProjectItem {
  id: string;
  content: {
    title: string;
    body: string;
  };
  fieldValues: {
    nodes: Array<{
      field: {
        name: string;
      };
      value?: string;
    }>;
  };
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';

/**
 * GraphQL query to fetch GitHub Project #1 items
 */
const PROJECT_ITEMS_QUERY = `
  query($login: String!) {
    user(login: $login) {
      projectV2(number: 1) {
        id
        title
        items(first: 100) {
          nodes {
            id
            content {
              ... on Issue {
                title
                body
              }
              ... on PullRequest {
                title
                body
              }
              ... on DraftIssue {
                title
                body
              }
            }
            fieldValues(first: 10) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field {
                    ... on ProjectV2SingleSelectField {
                      name
                    }
                  }
                }
                ... on ProjectV2ItemFieldTextValue {
                  text
                  field {
                    ... on ProjectV2Field {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * GraphQL mutation to update project item status
 */
const UPDATE_PROJECT_ITEM_MUTATION = `
  mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: String!) {
    updateProjectV2ItemFieldValue(
      input: {
        projectId: $projectId
        itemId: $itemId
        fieldId: $fieldId
        value: {
          singleSelectOptionId: $value
        }
      }
    ) {
      projectV2Item {
        id
      }
    }
  }
`;

/**
 * Make authenticated GitHub API request
 */
async function githubRequest(url: string, options: RequestInit = {}) {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token not configured');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Project-Dashboard/1.0',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} ${error}`);
  }

  return response.json();
}

/**
 * Make GitHub GraphQL request
 */
async function githubGraphQLRequest(query: string, variables: any = {}) {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token not configured');
  }

  const response = await fetch(GITHUB_GRAPHQL_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Project-Dashboard/1.0',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub GraphQL error: ${response.status} ${error}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  return result.data;
}

/**
 * Map GitHub Project status values to kanban columns
 */
function mapProjectStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'Todo': 'todo',
    'In Progress': 'inprogress', 
    'In progress': 'inprogress',
    'On Hold': 'onhold',
    'Done': 'done',
    'Completed': 'done',
  };
  
  return statusMap[status] || 'todo';
}

/**
 * Extract repository URL from project body
 */
function extractRepoUrl(body: string): string {
  const repoMatch = body.match(/https:\/\/github\.com\/[^\/]+\/[^\s\)]+/);
  return repoMatch ? repoMatch[0] : '';
}

/**
 * Fetch all items from GitHub Project #1
 */
export async function fetchProjects(): Promise<GitHubProject[]> {
  try {
    const data = await githubGraphQLRequest(PROJECT_ITEMS_QUERY, {
      login: 'ToscanRivera'
    });

    if (!data.user?.projectV2?.items?.nodes) {
      return [];
    }

    const items: GitHubProjectItem[] = data.user.projectV2.items.nodes;
    
    return items
      .filter(item => item.content?.title) // Filter out items without content
      .map(item => {
        // Find status field value
        const statusField = item.fieldValues.nodes.find(
          field => field.field?.name === 'Status'
        );
        
        const rawStatus = statusField?.value || 'Todo';
        const status = mapProjectStatus(rawStatus);
        const body = item.content.body || '';
        
        return {
          id: item.id,
          title: item.content.title,
          body,
          status,
          repository: extractRepoUrl(body),
          description: body.split('\n')[0] || '', // First line as description
        };
      });
  } catch (error) {
    console.error('Error fetching GitHub projects:', error);
    throw error;
  }
}

/**
 * Get PR review status
 */
function getPRReviewStatus(pr: any): 'none' | 'requested' | 'approved' | 'merged' {
  if (pr.merged) return 'merged';
  if (pr.state === 'closed') return 'merged';
  
  // This is a simplified version - in reality we'd need to check reviews
  // For now, we'll use a heuristic based on PR state
  return 'none';
}

/**
 * Map PR status to content pipeline columns
 */
function mapPRToContentStatus(pr: any): 'draft' | 'review' | 'approved' | 'published' {
  if (pr.merged || pr.state === 'closed') return 'published';
  
  const reviewStatus = getPRReviewStatus(pr);
  
  switch (reviewStatus) {
    case 'approved':
      return 'approved';
    case 'requested':
      return 'review';
    default:
      return 'draft';
  }
}

/**
 * Fetch open PRs from ToscanRivera/the-door that touch articles
 */
export async function fetchContentPRs(): Promise<GitHubPR[]> {
  try {
    const prs = await githubRequest(`${GITHUB_API_BASE}/repos/ToscanRivera/the-door/pulls?state=all&per_page=50`);
    
    const contentPRs: GitHubPR[] = [];
    
    for (const pr of prs) {
      // Get files changed in this PR
      const files = await githubRequest(`${GITHUB_API_BASE}/repos/ToscanRivera/the-door/pulls/${pr.number}/files`);
      
      // Check if any files touch src/content/articles/
      const hasArticleChanges = files.some((file: any) => 
        file.filename.includes('src/content/articles/') || 
        file.filename.includes('content/articles/')
      );
      
      if (hasArticleChanges) {
        contentPRs.push({
          number: pr.number,
          title: pr.title,
          state: pr.state,
          user: {
            login: pr.user.login,
          },
          created_at: pr.created_at,
          files_changed: files.length,
          review_status: getPRReviewStatus(pr),
        });
      }
    }
    
    return contentPRs;
  } catch (error) {
    console.error('Error fetching content PRs:', error);
    throw error;
  }
}

/**
 * Approve a PR by creating an approving review
 */
export async function approvePR(prNumber: number): Promise<void> {
  try {
    await githubRequest(
      `${GITHUB_API_BASE}/repos/ToscanRivera/the-door/pulls/${prNumber}/reviews`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'APPROVE',
          body: 'Approved via Project Dashboard',
        }),
      }
    );
  } catch (error) {
    console.error('Error approving PR:', error);
    throw error;
  }
}

/**
 * Demo mode fallbacks when GitHub token is not available
 */
export const demoData = {
  projects: [
    {
      id: 'demo-1',
      title: 'FidelTrad',
      body: 'MVP complete, v2 PR pending\nhttps://github.com/Rene-Rivera/Fideltrad',
      status: 'onhold',
      repository: 'https://github.com/Rene-Rivera/Fideltrad',
      description: 'MVP complete, v2 PR pending',
    },
    {
      id: 'demo-2', 
      title: 'The Door',
      body: 'Creative project in active development\nhttps://github.com/ToscanRivera/the-door',
      status: 'inprogress',
      repository: 'https://github.com/ToscanRivera/the-door',
      description: 'Creative project in active development',
    },
    {
      id: 'demo-3',
      title: 'Project Dashboard',
      body: 'This dashboard — executive project overview\nhttps://github.com/ToscanRivera/project-dashboard',
      status: 'inprogress',
      repository: 'https://github.com/ToscanRivera/project-dashboard', 
      description: 'This dashboard — executive project overview',
    },
  ] as GitHubProject[],

  contentPRs: [
    {
      number: 123,
      title: 'Add article: Building AI-Powered Dashboards',
      state: 'open' as const,
      user: { login: 'ToscanRivera' },
      created_at: '2024-02-15T10:00:00Z',
      files_changed: 3,
      review_status: 'none' as const,
    },
    {
      number: 124,
      title: 'Update article: The Future of CMS',
      state: 'open' as const,
      user: { login: 'ToscanRivera' },
      created_at: '2024-02-14T14:30:00Z',
      files_changed: 2,
      review_status: 'requested' as const,
    },
    {
      number: 125,
      title: 'Article: Authentication Patterns',
      state: 'closed' as const,
      user: { login: 'ToscanRivera' },
      created_at: '2024-02-13T09:15:00Z',
      files_changed: 1,
      review_status: 'merged' as const,
    },
  ] as GitHubPR[],
};