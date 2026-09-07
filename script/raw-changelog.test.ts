import { describe, test, expect } from "bun:test"
import { format, groupCommits, formatSection, formatContributors, sectionHasEntries, createGroups } from "./raw-changelog"

describe("createGroups", () => {
  test("creates empty Improvements/Bugfixes buckets for every section", () => {
    const groups = createGroups()
    expect(groups.get("Core")?.get("Improvements")).toEqual([])
    expect(groups.get("Core")?.get("Bugfixes")).toEqual([])
  })
})

describe("sectionHasEntries", () => {
  test("returns false when all buckets are empty", () => {
    const groups = new Map([["Improvements", []], ["Bugfixes", []]])
    expect(sectionHasEntries(groups)).toBe(false)
  })
  test("returns true when at least one bucket has entries", () => {
    const groups = new Map([["Improvements", ["- fix something"]], ["Bugfixes", []]])
    expect(sectionHasEntries(groups)).toBe(true)
  })
})

describe("groupCommits", () => {
  test("groups a commit into the correct section and type", () => {
    const commits = [
      { hash: "abc1234", author: "someone", message: "fix: broken thing", areas: new Set(["core"]) },
    ]
    const grouped = groupCommits(commits)
    expect(grouped.get("Core")?.get("Bugfixes")).toHaveLength(1)
    expect(grouped.get("Core")?.get("Bugfixes")?.[0]).toContain("fix: broken thing")
  })
})

describe("format", () => {
  test("renders 'No notable changes.' when there are no commits", () => {
    const result = format("1.0.0", "HEAD", [], [])
    expect(result).toContain("No notable changes.")
  })

  test("includes commit message under the correct section header", () => {
    const commits = [
      { hash: "abc1234", author: "someone", message: "fix: broken thing", areas: new Set(["core"]) },
    ]
    const result = format("1.0.0", "HEAD", commits, [])
    expect(result).toContain("## Core")
    expect(result).toContain("fix: broken thing")
  })

  test("includes contributor thanks section when provided", () => {
    const result = format("1.0.0", "HEAD", [], ["**Thank you to 1 community contributor:**", "- @someone:"])
    expect(result).toContain("## Community Contributors Input")
  })
})