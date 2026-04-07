package api

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"cc-look/backend/internal/claudedir"
)

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func cors(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next(w, r)
	}
}

func Register(mux *http.ServeMux) {
	mux.HandleFunc("/api/settings", cors(getSettings))
	mux.HandleFunc("/api/projects", cors(getProjects))
	mux.HandleFunc("/api/usage/summary", cors(getSummary))
	mux.HandleFunc("/api/plugins", cors(getPlugins))
	mux.HandleFunc("/api/skills", cors(getSkills))
	mux.HandleFunc("/api/commands", cors(getCommands))
	mux.HandleFunc("/api/history", cors(getHistory))
	// /api/projects/{id}/sessions
	// /api/projects/{id}/sessions/{sid}
	mux.HandleFunc("/api/projects/", cors(routeProject))
}

func getSettings(w http.ResponseWriter, r *http.Request) {
	p, err := claudedir.SettingsPath()
	if err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	b, err := os.ReadFile(p)
	if err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	var v any
	if err := json.Unmarshal(b, &v); err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	writeJSON(w, 200, v)
}

func getProjects(w http.ResponseWriter, r *http.Request) {
	list, err := claudedir.ListProjects()
	if err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	writeJSON(w, 200, list)
}

func getSummary(w http.ResponseWriter, r *http.Request) {
	s, err := claudedir.GetSummary()
	if err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	writeJSON(w, 200, s)
}

func getPlugins(w http.ResponseWriter, r *http.Request) {
	v, err := claudedir.ListPlugins()
	if err != nil { writeErr(w, 500, err.Error()); return }
	writeJSON(w, 200, v)
}

func getSkills(w http.ResponseWriter, r *http.Request) {
	v, err := claudedir.ListSkills()
	if err != nil { writeErr(w, 500, err.Error()); return }
	writeJSON(w, 200, v)
}

func getCommands(w http.ResponseWriter, r *http.Request) {
	v, err := claudedir.ListCommands()
	if err != nil { writeErr(w, 500, err.Error()); return }
	writeJSON(w, 200, v)
}

func getHistory(w http.ResponseWriter, r *http.Request) {
	v, err := claudedir.LoadHistoryByDay()
	if err != nil { writeErr(w, 500, err.Error()); return }
	writeJSON(w, 200, v)
}

// 解析 /api/projects/{id}[/sessions[/{sid}]]
func routeProject(w http.ResponseWriter, r *http.Request) {
	rest := strings.TrimPrefix(r.URL.Path, "/api/projects/")
	parts := strings.Split(rest, "/")
	if len(parts) == 0 || parts[0] == "" {
		writeErr(w, 400, "missing project id")
		return
	}
	projectID := parts[0]
	if len(parts) == 1 {
		// project info
		sessions, err := claudedir.ListSessions(projectID)
		if err != nil {
			writeErr(w, 500, err.Error())
			return
		}
		writeJSON(w, 200, map[string]any{
			"id":       projectID,
			"cwd":      claudedir.DecodeProjectID(projectID),
			"sessions": sessions,
		})
		return
	}
	if parts[1] != "sessions" {
		writeErr(w, 404, "not found")
		return
	}
	if len(parts) == 2 {
		sessions, err := claudedir.ListSessions(projectID)
		if err != nil {
			writeErr(w, 500, err.Error())
			return
		}
		writeJSON(w, 200, sessions)
		return
	}
	sid := parts[2]
	d, err := claudedir.GetSession(projectID, sid)
	if err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	writeJSON(w, 200, d)
}
