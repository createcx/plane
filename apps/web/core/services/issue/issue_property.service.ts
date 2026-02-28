import { API_BASE_URL } from "@plane/constants";
import type { TIssueTypeProperty, TIssuePropertyValue } from "@/plane-web/types/issue-types/issue-property-values";
import { APIService } from "@/services/api.service";

export class IssuePropertyService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async getPropertyDefinitions(
    workspaceSlug: string,
    typeId: string
  ): Promise<TIssueTypeProperty[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/issue-types/${typeId}/properties/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getPropertyValues(
    workspaceSlug: string,
    projectId: string,
    issueId: string
  ): Promise<TIssuePropertyValue[]> {
    return this.get(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/properties/`
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async bulkUpsertPropertyValues(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    values: Record<string, Record<string, any>>
  ): Promise<TIssuePropertyValue[]> {
    return this.put(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/properties/`,
      { values }
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
