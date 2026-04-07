package claudedir

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
)

type PluginInstall struct {
	Name         string `json:"name"`
	Scope        string `json:"scope"`
	InstallPath  string `json:"installPath"`
	Version      string `json:"version"`
	InstalledAt  string `json:"installedAt"`
	LastUpdated  string `json:"lastUpdated"`
	GitCommitSha string `json:"gitCommitSha"`
}

type installedPluginsFile struct {
	Version int                        `json:"version"`
	Plugins map[string][]PluginInstall `json:"plugins"`
}

func ListPlugins() ([]PluginInstall, error) {
	h, err := HomeDir()
	if err != nil {
		return nil, err
	}
	b, err := os.ReadFile(filepath.Join(h, "plugins", "installed_plugins.json"))
	if err != nil {
		if os.IsNotExist(err) {
			return []PluginInstall{}, nil
		}
		return nil, err
	}
	var f installedPluginsFile
	if err := json.Unmarshal(b, &f); err != nil {
		return nil, err
	}
	var out []PluginInstall
	for name, list := range f.Plugins {
		for _, p := range list {
			p.Name = name
			out = append(out, p)
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Name < out[j].Name })
	return out, nil
}
