interface IssueMetadata {
  expand: string;
  projects: Project[];
}

interface Project {
  id: string;
  key: string;
  name: string;
  avatarUrls: AvatarUrls;
  issuetypes: Issuetype[];
}

interface Issuetype {
  id: string;
  description: string;
  iconUrl: string;
  name: string;
  subtask: boolean;
  fields: any;
}

interface AvatarUrls {
  '48x48': string;
  '24x24': string;
  '16x16': string;
  '32x32': string;
}