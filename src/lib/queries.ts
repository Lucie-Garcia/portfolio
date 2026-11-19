import { db } from "./db";

export type Skill = {
  id: number;
  slug: string;
  name: string;
  category: "langage" | "framework" | "outil" | "design" | "autre";
  logo_path: string | null;
  description: string | null;
  level: number;
  opinion: string | null;
  sort_order: number;
  is_visible: number;
};

export type ProjectCard = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  cover_path: string | null;
  cover_alt: string | null;
  started_on: string | null;
  tags: Array<{ name: string; slug: string }>;
};

export type ProjectDetail = ProjectCard & {
  context: string | null;
  objective: string | null;
  result: string | null;
  learnings: string | null;
  role: string | null;
  ended_on: string | null;
  images: Array<{ path: string; alt: string; caption: string | null }>;
  links: Array<{ kind: string; label: string; url: string }>;
  tags: Array<{ name: string; slug: string }>;
  skills: Array<{
    name: string;
    slug: string;
    logo_path: string | null;
    level: number;
    description: string | null;
    opinion: string | null;
    usage_note: string | null;
  }>;
};

export function getSkills(): Skill[] {
  return db
    .prepare(
      `SELECT id, slug, name, category, logo_path, description, level,
              opinion, sort_order, is_visible
       FROM skills
       WHERE is_visible = 1
       ORDER BY category, sort_order, name`,
    )
    .all() as Skill[];
}

export function getProjects(tag: string | null = null): ProjectCard[] {
  const projects = db
    .prepare(
      `SELECT p.id, p.slug, p.title, p.summary, p.cover_path,
              p.cover_alt, p.started_on,
              (
                SELECT GROUP_CONCAT(tag_data.name, '|')
                FROM (
                  SELECT t.name
                  FROM project_tags pt2
                  JOIN tags t ON t.id = pt2.tag_id
                  WHERE pt2.project_id = p.id
                  ORDER BY t.name
                ) AS tag_data
              ) AS tag_names
       FROM projects p
       WHERE p.is_published = 1
         AND (
           @tag IS NULL
           OR EXISTS (
             SELECT 1
             FROM project_tags pt
             JOIN tags t ON t.id = pt.tag_id
             WHERE pt.project_id = p.id AND t.slug = @tag
           )
         )
       ORDER BY p.started_on DESC, p.is_featured DESC, p.sort_order, p.title`,
    )
    .all({ tag }) as Array<Omit<ProjectCard, "tags"> & { tag_names: string | null }>;

  return projects.map(({ tag_names, ...project }) => ({
    ...project,
    tags: tag_names
      ? tag_names.split("|").map((name) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
      }))
      : [],
  }));
}

export function getProject(slug: string): ProjectDetail | null {
  const project = db
    .prepare(
      `SELECT id, slug, title, summary, cover_path, cover_alt, started_on,
              context, objective, result, learnings, role, ended_on
       FROM projects
       WHERE slug = ? AND is_published = 1`,
    )
    .get(slug) as Omit<ProjectDetail, "images" | "links" | "tags" | "skills"> | undefined;

  if (!project) return null;

  const images = db
    .prepare(
      `SELECT path, alt, caption
       FROM project_images
       WHERE project_id = ?
       ORDER BY sort_order, id`,
    )
    .all(project.id) as ProjectDetail["images"];
  const links = db
    .prepare(
      `SELECT kind, label, url
       FROM project_links
       WHERE project_id = ?
       ORDER BY sort_order, id`,
    )
    .all(project.id) as ProjectDetail["links"];
  const tags = db
    .prepare(
      `SELECT t.name, t.slug
       FROM project_tags pt
       JOIN tags t ON t.id = pt.tag_id
       WHERE pt.project_id = ?
       ORDER BY t.name`,
    )
    .all(project.id) as ProjectDetail["tags"];
  const skills = db
    .prepare(
      `SELECT s.name, s.slug, s.logo_path, s.level, s.description, s.opinion, ps.usage_note
       FROM project_skills ps
       JOIN skills s ON s.id = ps.skill_id
       WHERE ps.project_id = ?
       ORDER BY s.sort_order, s.name`,
    )
    .all(project.id) as ProjectDetail["skills"];

  return { ...project, images, links, tags, skills };
}
