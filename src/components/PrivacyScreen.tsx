import { Lang } from '../i18n'

interface Props {
  lang: Lang
  onBack: () => void
}

export default function PrivacyScreen({ lang, onBack }: Props) {
  if (lang === 'ja') {
    return (
      <div className="screen-privacy">
        <div className="hdr">
          <button className="hdr-back" onClick={onBack}>{'< 戻る'}</button>
          <span className="hdr-title">プライバシーポリシー</span>
          <div style={{ width: 48 }} />
        </div>
        <div className="privacy-body">
          <h2>プライバシーポリシー</h2>
          <p className="privacy-date">最終更新日：2026年4月7日</p>

          <h3>1. はじめに</h3>
          <p>
            BREW Protocol（以下「本サービス」）は、コーヒー抽出をサポートするウェブアプリケーションです。
            本プライバシーポリシーは、本サービスにおける情報の収集・利用・管理方針について説明します。
          </p>

          <h3>2. 収集する情報</h3>
          <p>本サービス自体は、ユーザーの個人情報（氏名・メールアドレス等）を収集しません。ただし、以下の情報が自動的に収集される場合があります：</p>
          <ul>
            <li>ページビュー数、セッション時間などの利用統計</li>
            <li>ブラウザの種類、OSの種類などの技術情報</li>
            <li>IPアドレス（Google Analyticsにより匿名化処理済み）</li>
            <li>Cookieおよびローカルストレージ（お気に入りレシピ・言語設定の保存のみ）</li>
          </ul>

          <h3>3. Googleアナリティクス</h3>
          <p>
            本サービスは、アクセス解析のためにGoogle LLC（以下「Google」）が提供するGoogle Analytics 4を使用しています。
            Google Analyticsは、Cookieを使用してユーザーの利用状況を収集・分析します。
            収集されたデータはGoogleのプライバシーポリシーに従って処理されます。
          </p>
          <p>
            Google Analyticsのデータ収集をオプトアウトするには、
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
              Google Analytics オプトアウトアドオン
            </a>
            をご利用ください。
          </p>

          <h3>4. 広告について</h3>
          <p>
            本サービスは、Google AdSenseによる広告を表示する場合があります。
            Google AdSenseは、ユーザーの興味・関心に基づいたパーソナライズ広告を配信するためにCookieを使用します。
            広告のカスタマイズはGoogleの広告設定（<a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>）から変更できます。
          </p>

          <h3>5. Cookieの使用</h3>
          <p>本サービスは以下の目的でCookieおよびローカルストレージを使用します：</p>
          <ul>
            <li>お気に入りレシピの保存（ローカルストレージ、端末内のみ）</li>
            <li>言語設定の保存（ローカルストレージ、端末内のみ）</li>
            <li>アクセス解析（Google Analytics Cookie）</li>
            <li>広告配信（Google AdSense Cookie、該当する場合）</li>
          </ul>
          <p>ブラウザの設定からCookieを無効化できますが、一部機能が正常に動作しない場合があります。</p>

          <h3>6. 第三者への情報提供</h3>
          <p>
            本サービスは、法令に基づく場合を除き、ユーザーの情報を第三者に販売・譲渡しません。
            ただし、Google Analytics・Google AdSenseによるデータ処理については、それぞれのプライバシーポリシーが適用されます。
          </p>

          <h3>7. ポリシーの変更</h3>
          <p>
            本プライバシーポリシーは予告なく変更される場合があります。
            重要な変更がある場合は、本ページにて通知します。
          </p>

          <h3>8. お問い合わせ</h3>
          <p>
            本プライバシーポリシーに関するご質問は、本サービスのサポートページまたはSNSアカウントよりお問い合わせください。
          </p>

          <div className="privacy-links">
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Googleプライバシーポリシー ↗
            </a>
            <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">
              Google広告ポリシー ↗
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="screen-privacy">
      <div className="hdr">
        <button className="hdr-back" onClick={onBack}>{'< BACK'}</button>
        <span className="hdr-title">PRIVACY POLICY</span>
        <div style={{ width: 48 }} />
      </div>
      <div className="privacy-body">
        <h2>Privacy Policy</h2>
        <p className="privacy-date">Last updated: April 7, 2026</p>

        <h3>1. Overview</h3>
        <p>
          BREW Protocol ("the Service") is a web application that guides coffee brewing.
          This Privacy Policy explains how we collect, use, and manage information when you use the Service.
        </p>

        <h3>2. Information We Collect</h3>
        <p>The Service does not collect personal information (such as name or email). The following information may be collected automatically:</p>
        <ul>
          <li>Usage statistics such as page views and session duration</li>
          <li>Technical information such as browser type and operating system</li>
          <li>IP address (anonymized by Google Analytics)</li>
          <li>Cookies and local storage (used only to save favorite recipes and language preferences)</li>
        </ul>

        <h3>3. Google Analytics</h3>
        <p>
          The Service uses Google Analytics 4, provided by Google LLC, for access analysis.
          Google Analytics uses cookies to collect and analyze usage data.
          Data collected is processed in accordance with Google's Privacy Policy.
        </p>
        <p>
          To opt out of Google Analytics data collection, use the{' '}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
            Google Analytics Opt-out Browser Add-on
          </a>.
        </p>

        <h3>4. Advertising</h3>
        <p>
          The Service may display advertisements through Google AdSense.
          Google AdSense uses cookies to serve personalized ads based on your interests.
          You can manage ad personalization at{' '}
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
            adssettings.google.com
          </a>.
        </p>

        <h3>5. Use of Cookies</h3>
        <p>The Service uses cookies and local storage for the following purposes:</p>
        <ul>
          <li>Saving favorite recipes (local storage, stored on your device only)</li>
          <li>Saving language preferences (local storage, stored on your device only)</li>
          <li>Access analytics (Google Analytics cookies)</li>
          <li>Ad delivery (Google AdSense cookies, where applicable)</li>
        </ul>
        <p>You may disable cookies in your browser settings, though some features may not function correctly.</p>

        <h3>6. Sharing of Information</h3>
        <p>
          The Service does not sell or transfer user information to third parties except as required by law.
          Data processed by Google Analytics and Google AdSense is subject to their respective privacy policies.
        </p>

        <h3>7. Changes to This Policy</h3>
        <p>
          This Privacy Policy may be updated without prior notice.
          Significant changes will be communicated on this page.
        </p>

        <h3>8. Contact</h3>
        <p>
          For questions about this Privacy Policy, please reach out through the Service's support channels or social media accounts.
        </p>

        <div className="privacy-links">
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Google Privacy Policy ↗
          </a>
          <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">
            Google Ads Policy ↗
          </a>
        </div>
      </div>
    </div>
  )
}
