// 项目数据结构
export interface Project {
    id: string
    name: string
    description: string
    status: 'active' | 'inactive'
    git_repo_id: string
    deployment_config_id: string
    nginx_config_id: string
    created_by: string
    created_at: Date
    updated_at: Date
    server_id: string
}

export interface DeploymentConfig {
    id: string
    project_id: string
    name: string
    deployment_path: string
    build_command: string
    start_command: string
    stop_command: string
    restart_command: string
    build_output_dir: string
    pre_deploy_script: string
    post_deploy_script: string
    env_variables: Record<string, string>
    auto_deploy: boolean
    auto_rollback: boolean
    created_at: Date
    updated_at: Date
}
export interface NginxConfig {
    id: string
    name: string
    server_name: string
    listen_port: number
    root_path: string
    config_content: string
    enabled: boolean
    last_applied_at: Date
    created_at: Date
    updated_at: Date
}