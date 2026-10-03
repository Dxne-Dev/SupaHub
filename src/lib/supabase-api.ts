export interface SupabaseProject {
  id: string;
  name: string;
  organization_id: string;
  region: string;
  created_at: string;
  status: "ACTIVE_HEALTHY" | "COMING_UP" | "GOING_DOWN" | "INACTIVE" | "RESTORING" | "PAUSED" | string;
  database?: {
    host: string;
    version: string;
  };
}

export interface SupabaseDbPasswordResponse {
  message?: string;
}

export class SupabaseManagementApi {
  private pat: string;
  private baseUrl = "https://api.supabase.com/v1";

  constructor(pat: string) {
    if (!pat) {
      throw new Error("Supabase Personal Access Token (PAT) is required.");
    }
    this.pat = pat;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.pat}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      let parsedError: any;
      try {
        parsedError = JSON.parse(errorText);
      } catch {
        parsedError = { message: errorText };
      }
      throw new Error(parsedError.message || `Supabase API Error ${res.status}: ${res.statusText}`);
    }

    // Si DELETE retourne 204 No Content
    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  }

  /**
   * Récupère la liste de tous les projets du compte Supabase
   */
  async listProjects(): Promise<SupabaseProject[]> {
    return this.request<SupabaseProject[]>("/projects");
  }

  /**
   * Récupère les détails d'un projet spécifique
   */
  async getProject(projectRef: string): Promise<SupabaseProject> {
    return this.request<SupabaseProject>(`/projects/${projectRef}`);
  }

  /**
   * Supprime un projet Supabase (Libération du slot gratuit)
   */
  async deleteProject(projectRef: string): Promise<{ id: string }> {
    return this.request<{ id: string }>(`/projects/${projectRef}`, {
      method: "DELETE",
    });
  }

  /**
   * Crée un nouveau projet Supabase
   */
  async createProject(params: {
    name: string;
    organization_id: string;
    db_pass: string;
    region: string;
    plan?: string;
  }): Promise<SupabaseProject> {
    return this.request<SupabaseProject>("/projects", {
      method: "POST",
      body: JSON.stringify({
        name: params.name,
        organization_id: params.organization_id,
        db_pass: params.db_pass,
        region: params.region,
        plan: params.plan || "free",
      }),
    });
  }

  /**
   * Récupère les organisations pour la création de projets
   */
  async listOrganizations(): Promise<Array<{ id: string; name: string }>> {
    return this.request<Array<{ id: string; name: string }>>("/organizations");
  }
}
