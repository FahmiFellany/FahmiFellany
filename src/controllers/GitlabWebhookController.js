/**
 * GitlabWebhookController
 * Controller backend OOP untuk menangani webhook POST payload dari GitLab.
 * Menerima body JSON, mencatat metadata event, dan merespon dengan status 200 OK.
 */
class GitlabWebhookController {
  constructor() {
    this.handleWebhook = this.handleWebhook.bind(this);
  }

  /**
   * Menangani request POST Webhook dari GitLab
   * @param {import('express').Request} req 
   * @param {import('express').Response} res 
   */
  handleWebhook(req, res) {
    try {
      const gitlabEvent = req.headers['x-gitlab-event'] || req.body?.object_kind || req.body?.event_name || req.body?.event_type || 'Unknown Event';
      const gitlabToken = req.headers['x-gitlab-token'] || null;
      const payload = req.body || {};

      // Ekstraksi info project & user jika tersedia di payload GitLab
      const projectName = payload.project?.name || payload.project?.path_with_namespace || payload.repository?.name || 'N/A';
      const userName = payload.user_name || payload.user_username || payload.user?.name || payload.user?.username || 'N/A';
      const ref = payload.ref || 'N/A';
      const totalCommits = Array.isArray(payload.commits) ? payload.commits.length : (payload.total_commits_count || 0);

      const timestamp = new Date().toISOString();

      console.log(`==================================================`);
      console.log(`[GitLab Webhook] Event Received at ${timestamp}`);
      console.log(`  Event Type : ${gitlabEvent}`);
      console.log(`  Project    : ${projectName}`);
      console.log(`  Triggered  : ${userName}`);
      console.log(`  Branch/Ref : ${ref}`);
      if (totalCommits > 0) {
        console.log(`  Commits    : ${totalCommits} commit(s)`);
      }
      console.log(`==================================================`);

      // Berikan respon 200 OK kembali ke GitLab
      return res.status(200).json({
        success: true,
        status: 200,
        message: 'GitLab webhook payload received successfully',
        data: {
          event: gitlabEvent,
          project: projectName,
          user: userName,
          ref: ref,
          receivedAt: timestamp
        }
      });
    } catch (err) {
      console.error('[GitLab Webhook Error]:', err);
      return res.status(200).json({
        success: false,
        status: 200,
        message: 'Webhook processed with errors',
        error: err.message
      });
    }
  }
}

module.exports = GitlabWebhookController;
