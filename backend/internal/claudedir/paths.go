package claudedir

import (
	"os"
	"path/filepath"
	"strings"
)

// HomeDir 返回 ~/.claude 路径
func HomeDir() (string, error) {
	h, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(h, ".claude"), nil
}

func ProjectsDir() (string, error) {
	h, err := HomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(h, "projects"), nil
}

func SettingsPath() (string, error) {
	h, err := HomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(h, "settings.json"), nil
}

// DecodeProjectID 把目录名（如 -Users-nc-rain-code）粗略还原成路径
// 注意：原路径中的 - 会和分隔符混淆，无法精确还原
func DecodeProjectID(id string) string {
	if id == "" {
		return ""
	}
	return "/" + strings.ReplaceAll(strings.TrimPrefix(id, "-"), "-", "/")
}
