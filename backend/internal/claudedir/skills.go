package claudedir

import (
	"bufio"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

type SkillInfo struct {
	Name         string `json:"name"`
	Description  string `json:"description"`
	UserInvocable bool  `json:"userInvocable"`
	Path         string `json:"path"`
}

type CommandInfo struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Path        string `json:"path"`
}

// parseFrontmatter 解析 Markdown 顶部 --- frontmatter（极简实现：key: value）
func parseFrontmatter(path string) (map[string]string, string, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, "", err
	}
	defer f.Close()
	sc := bufio.NewScanner(f)
	sc.Buffer(make([]byte, 1024*1024), 4*1024*1024)
	meta := map[string]string{}
	var firstBody string
	state := 0 // 0=before, 1=inside, 2=after
	for sc.Scan() {
		line := sc.Text()
		switch state {
		case 0:
			if strings.TrimSpace(line) == "---" {
				state = 1
			} else {
				// 没有 frontmatter
				firstBody = strings.TrimSpace(line)
				state = 2
			}
		case 1:
			if strings.TrimSpace(line) == "---" {
				state = 2
				continue
			}
			if i := strings.Index(line, ":"); i > 0 {
				k := strings.TrimSpace(line[:i])
				v := strings.TrimSpace(line[i+1:])
				meta[k] = v
			}
		case 2:
			if firstBody == "" && strings.TrimSpace(line) != "" {
				firstBody = strings.TrimSpace(line)
			}
		}
	}
	return meta, firstBody, sc.Err()
}

func ListSkills() ([]SkillInfo, error) {
	h, err := HomeDir()
	if err != nil {
		return nil, err
	}
	dir := filepath.Join(h, "skills")
	entries, err := os.ReadDir(dir)
	if err != nil {
		if os.IsNotExist(err) {
			return []SkillInfo{}, nil
		}
		return nil, err
	}
	var out []SkillInfo
	for _, e := range entries {
		if !e.IsDir() {
			continue
		}
		skillPath := filepath.Join(dir, e.Name(), "SKILL.md")
		meta, _, _ := parseFrontmatter(skillPath)
		out = append(out, SkillInfo{
			Name:          firstNonEmpty(meta["name"], e.Name()),
			Description:   meta["description"],
			UserInvocable: meta["user-invocable"] == "true",
			Path:          skillPath,
		})
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Name < out[j].Name })
	return out, nil
}

func ListCommands() ([]CommandInfo, error) {
	h, err := HomeDir()
	if err != nil {
		return nil, err
	}
	dir := filepath.Join(h, "commands")
	entries, err := os.ReadDir(dir)
	if err != nil {
		if os.IsNotExist(err) {
			return []CommandInfo{}, nil
		}
		return nil, err
	}
	var out []CommandInfo
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") {
			continue
		}
		path := filepath.Join(dir, e.Name())
		meta, body, _ := parseFrontmatter(path)
		desc := meta["description"]
		if desc == "" {
			desc = body
		}
		out = append(out, CommandInfo{
			Name:        strings.TrimSuffix(e.Name(), ".md"),
			Description: desc,
			Path:        path,
		})
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Name < out[j].Name })
	return out, nil
}

func firstNonEmpty(a, b string) string {
	if a != "" {
		return a
	}
	return b
}
