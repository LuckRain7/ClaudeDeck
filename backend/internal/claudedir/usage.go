package claudedir

type Summary struct {
	Total      Usage              `json:"total"`
	ByProject  []ProjectInfo      `json:"byProject"`
	ByModel    map[string]Usage   `json:"byModel"`
}

func GetSummary() (*Summary, error) {
	projects, err := ListProjects()
	if err != nil {
		return nil, err
	}
	s := &Summary{ByProject: projects, ByModel: map[string]Usage{}}
	for _, p := range projects {
		s.Total.Add(p.Usage)
		// 进一步按 model 聚合需要再扫一遍 sessions
		sessions, err := ListSessions(p.ID)
		if err != nil {
			continue
		}
		for _, sess := range sessions {
			// 把 session usage 平均落到每个 model 上不准确，
			// 简化：粗略归到第一个 model
			if len(sess.Models) == 0 {
				continue
			}
			m := sess.Models[0]
			u := s.ByModel[m]
			u.Add(sess.Usage)
			s.ByModel[m] = u
		}
	}
	return s, nil
}
