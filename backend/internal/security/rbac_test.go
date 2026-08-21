package security

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRequireRoles(t *testing.T) {
	next := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusNoContent) })
	handler := RequireRoles("admin")(next)

	unauthenticated := httptest.NewRecorder()
	handler.ServeHTTP(unauthenticated, httptest.NewRequest(http.MethodGet, "/", nil))
	if unauthenticated.Code != http.StatusUnauthorized {
		t.Fatalf("unauthenticated status = %d", unauthenticated.Code)
	}

	for _, test := range []struct {
		role string
		want int
	}{{role: "buyer", want: http.StatusForbidden}, {role: "admin", want: http.StatusNoContent}} {
		recorder := httptest.NewRecorder()
		request := httptest.NewRequest(http.MethodGet, "/", nil).WithContext(WithClaims(httptest.NewRequest(http.MethodGet, "/", nil).Context(), Claims{UserID: "user-1", Role: test.role}))
		handler.ServeHTTP(recorder, request)
		if recorder.Code != test.want {
			t.Fatalf("role %s status = %d, want %d", test.role, recorder.Code, test.want)
		}
	}
}
