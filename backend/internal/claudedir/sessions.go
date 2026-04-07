package claudedir

import (
	"bufio"
	"encoding/json"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// Usage 对应 message.usage
type Usage struct {
	InputTokens              int `json:"input_tokens"`
	OutputTokens             int `json:"output_tokens"`
	CacheCreationInputTokens int `json:"cache_creation_input_tokens"`
	CacheReadInputTokens     int `json:"cache_read_input_tokens"`
}

func (u *Usage) Add(o Usage) {
	u.InputTokens += o.InputTokens
	u.OutputTokens += o.OutputTokens
	u.CacheCreationInputTokens += o.CacheCreationInputTokens
	u.CacheReadInputTokens += o.CacheReadInputTokens
}

func (u Usage) Total() int {
	return u.InputTokens + u.OutputTokens + u.CacheCreationInputTokens + u.CacheReadInputTokens
}

// rawEvent 仅解析需要的字段
type rawEvent struct {
	Type      string `json:"type"`
	Timestamp string `json:"timestamp"`
	SessionID string `json:"sessionId"`
	Cwd       string `json:"cwd"`
	GitBranch string `json:"gitBranch"`
	UUID      string `json:"uuid"`
	Message   *struct {
		Model string `json:"model"`
		Role  string `json:"role"`
		Usage *Usage `json:"usage"`
	} `json:"message"`
}

// SessionSummary 单 session 概览
type SessionSummary struct {
	SessionID    string   `json:"sessionId"`
	File         string   `json:"file"`
	StartedAt    string   `json:"startedAt"`
	EndedAt      string   `json:"endedAt"`
	MessageCount int      `json:"messageCount"`
	Usage        Usage    `json:"usage"`
	Models       []string `json:"models"`
}

// SessionDetail 详情：消息列表 + usage 汇总
type SessionDetail struct {
	SessionSummary
	Messages []SessionMessage `json:"messages"`
}

type SessionMessage struct {
	UUID      string `json:"uuid"`
	Type      string `json:"type"`
	Role      string `json:"role,omitempty"`
	Model     string `json:"model,omitempty"`
	Timestamp string `json:"timestamp"`
	Usage     *Usage `json:"usage,omitempty"`
}

// scanSessionFile 扫描一个 jsonl 文件，返回 summary（不含 messages）
func scanSessionFile(path string, withMessages bool) (*SessionDetail, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	d := &SessionDetail{}
	d.File = filepath.Base(path)
	d.SessionID = strings.TrimSuffix(d.File, ".jsonl")

	scanner := bufio.NewScanner(f)
	scanner.Buffer(make([]byte, 1024*1024), 16*1024*1024)
	modelSet := map[string]struct{}{}

	for scanner.Scan() {
		line := scanner.Bytes()
		if len(line) == 0 {
			continue
		}
		var ev rawEvent
		if err := json.Unmarshal(line, &ev); err != nil {
			continue
		}
		d.MessageCount++
		if d.StartedAt == "" || (ev.Timestamp != "" && ev.Timestamp < d.StartedAt) {
			if ev.Timestamp != "" {
				d.StartedAt = ev.Timestamp
			}
		}
		if ev.Timestamp > d.EndedAt {
			d.EndedAt = ev.Timestamp
		}
		var msg SessionMessage
		msg.UUID = ev.UUID
		msg.Type = ev.Type
		msg.Timestamp = ev.Timestamp
		if ev.Message != nil {
			msg.Role = ev.Message.Role
			msg.Model = ev.Message.Model
			if ev.Message.Model != "" {
				modelSet[ev.Message.Model] = struct{}{}
			}
			if ev.Type == "assistant" && ev.Message.Usage != nil {
				d.Usage.Add(*ev.Message.Usage)
				msg.Usage = ev.Message.Usage
			}
		}
		if withMessages {
			d.Messages = append(d.Messages, msg)
		}
	}
	if err := scanner.Err(); err != nil && err != io.EOF {
		return nil, err
	}
	for m := range modelSet {
		d.Models = append(d.Models, m)
	}
	sort.Strings(d.Models)
	return d, nil
}

// ListSessions 列出某项目下所有 session 的 summary
func ListSessions(projectID string) ([]SessionSummary, error) {
	pdir, err := ProjectsDir()
	if err != nil {
		return nil, err
	}
	dir := filepath.Join(pdir, projectID)
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	var out []SessionSummary
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".jsonl") {
			continue
		}
		d, err := scanSessionFile(filepath.Join(dir, e.Name()), false)
		if err != nil {
			continue
		}
		out = append(out, d.SessionSummary)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].EndedAt > out[j].EndedAt })
	return out, nil
}

// GetSession 读取单 session 详情
func GetSession(projectID, sessionID string) (*SessionDetail, error) {
	pdir, err := ProjectsDir()
	if err != nil {
		return nil, err
	}
	path := filepath.Join(pdir, projectID, sessionID+".jsonl")
	return scanSessionFile(path, true)
}
