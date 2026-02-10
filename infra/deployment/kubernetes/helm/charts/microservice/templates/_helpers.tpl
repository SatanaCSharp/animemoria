{{/*
Expand the name of the chart.
*/}}
{{- define "microservice.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "microservice.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "microservice.labels" -}}
helm.sh/chart: {{ include "microservice.name" . }}
app.kubernetes.io/name: {{ include "microservice.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "microservice.selectorLabels" -}}
app.kubernetes.io/name: {{ include "microservice.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Protocol: http (default) or grpc. Convention over configuration.
*/}}
{{- define "microservice.protocol" -}}
{{- .Values.protocol | default "http" }}
{{- end }}

{{/*
Container port by convention: grpc -> 5000, http -> 3000.
*/}}
{{- define "microservice.containerPort" -}}
{{- if eq (include "microservice.protocol" .) "grpc" }}5000{{- else }}3000{{- end }}
{{- end }}

{{/*
Port name for container/Service: grpc -> grpc-server, http -> http.
*/}}
{{- define "microservice.portName" -}}
{{- if eq (include "microservice.protocol" .) "grpc" }}grpc-server{{- else }}http{{- end }}
{{- end }}

{{/*
Service (exposed) port: grpc -> 5000, http -> 80. Maps 80->3000 (HTTP) or 5000->5000 (gRPC).
*/}}
{{- define "microservice.servicePort" -}}
{{- if eq (include "microservice.protocol" .) "grpc" }}5000{{- else }}80{{- end }}
{{- end }}

{{/*
Env key for port: grpc -> APP_GRPC_PORT, http -> APP_PORT.
*/}}
{{- define "microservice.portEnvKey" -}}
{{- if eq (include "microservice.protocol" .) "grpc" }}APP_GRPC_PORT{{- else }}APP_PORT{{- end }}
{{- end }}
