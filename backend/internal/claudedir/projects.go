package claudedir

import (
	"os"
	"sort"
)

type ProjectInfo struct {
	ID           string `json:"id"`
	Cwd          string `json:"cwd"`
	SessionCount int    `json:"sessionCount"`
	LastActive   string `json:"lastActive"`
	Usage        Usage  `json:"usage"`
}

func ListProjects() ([]ProjectInfo, error) {
	pdir, err := ProjectsDir()
	if err != nil {
		return nil, err
	}
	entries, err := os.ReadDir(pdir)
	if err != nil {
		return nil, err
	}
	var out []ProjectInfo
	for _, e := range entries {
		if !e.IsDir() {
			continue
		}
		sessions, err := ListSessions(e.Name())
		if err != nil {
			continue
		}
		p := ProjectInfo{
			ID:           e.Name(),
			Cwd:          DecodeProjectID(e.Name()),
			SessionCount: len(sessions),
		}
		for _, s := range sessions {
			p.Usage.Add(s.Usage)
			if s.EndedAt > p.LastActive {
				p.LastActive = s.EndedAt
			}
		}
		out = append(out, p)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].LastActive > out[j].LastActive })
	return out, nil
}
