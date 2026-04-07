package claudedir

import (
	"bufio"
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
	"time"
)

type HistoryEntry struct {
	Display   string `json:"display"`
	Timestamp int64  `json:"timestamp"`
	Project   string `json:"project"`
	SessionID string `json:"sessionId"`
}

type HistoryDay struct {
	Date    string         `json:"date"`
	Count   int            `json:"count"`
	Entries []HistoryEntry `json:"entries"`
}

// LoadHistoryByDay 读取 ~/.claude/history.jsonl，按天（本地时区）分组返回
func LoadHistoryByDay() ([]HistoryDay, error) {
	h, err := HomeDir()
	if err != nil {
		return nil, err
	}
	f, err := os.Open(filepath.Join(h, "history.jsonl"))
	if err != nil {
		if os.IsNotExist(err) {
			return []HistoryDay{}, nil
		}
		return nil, err
	}
	defer f.Close()

	groups := map[string][]HistoryEntry{}
	sc := bufio.NewScanner(f)
	sc.Buffer(make([]byte, 1024*1024), 16*1024*1024)
	for sc.Scan() {
		line := sc.Bytes()
		if len(line) == 0 {
			continue
		}
		var e HistoryEntry
		if err := json.Unmarshal(line, &e); err != nil {
			continue
		}
		date := time.UnixMilli(e.Timestamp).Local().Format("2006-01-02")
		groups[date] = append(groups[date], e)
	}
	if err := sc.Err(); err != nil {
		return nil, err
	}

	out := make([]HistoryDay, 0, len(groups))
	for d, list := range groups {
		// 同一天内按时间倒序
		sort.Slice(list, func(i, j int) bool { return list[i].Timestamp > list[j].Timestamp })
		out = append(out, HistoryDay{Date: d, Count: len(list), Entries: list})
	}
	// 日期倒序
	sort.Slice(out, func(i, j int) bool { return out[i].Date > out[j].Date })
	return out, nil
}
