package com.sproutsiege.retro;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.OutputStream;

/** Hosts the HTML5 game full-screen in a WebView. */
public class MainActivity extends Activity implements ValueCallback<String> {
    private static final int PICK_FILE = 41;
    private WebView web;
    private ValueCallback<Uri[]> pendingPick;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_FULLSCREEN);
        if (Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(lp);
        }
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(28, 42, 18));
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setVerticalScrollBarEnabled(false);
        web.setHorizontalScrollBarEnabled(false);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setSupportZoom(false);
        web.setWebViewClient(new WebViewClient());
        web.setWebChromeClient(new FilePicker(this));
        web.addJavascriptInterface(new SaveBridge(this), "SproutAndroid");
        setContentView(web);
        hideSystemUi();
        web.loadUrl("file:///android_asset/index.html");
    }

    /** Lets the game's "Import save file" button open the system file picker. */
    static final class FilePicker extends WebChromeClient {
        private final MainActivity act;
        FilePicker(MainActivity act) { this.act = act; }
        @Override
        public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
            if (act.pendingPick != null) act.pendingPick.onReceiveValue(null);
            act.pendingPick = callback;
            Intent i = new Intent(Intent.ACTION_GET_CONTENT);
            i.addCategory(Intent.CATEGORY_OPENABLE);
            i.setType("*/*");
            try {
                act.startActivityForResult(Intent.createChooser(i, "Choose a Sprout Siege save file"), PICK_FILE);
            } catch (Exception e) {
                act.pendingPick = null;
                return false;
            }
            return true;
        }
    }

    /** Lets the game's "Export save file" button save into Downloads (or share it on older Android). */
    static final class SaveBridge {
        private final MainActivity act;
        SaveBridge(MainActivity act) { this.act = act; }
        @JavascriptInterface
        public boolean saveFile(String name, String text) {
            if (Build.VERSION.SDK_INT >= 29) {
                try {
                    ContentValues v = new ContentValues();
                    v.put(MediaStore.Downloads.DISPLAY_NAME, name);
                    v.put(MediaStore.Downloads.MIME_TYPE, "application/json");
                    Uri uri = act.getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                    if (uri != null) {
                        OutputStream os = act.getContentResolver().openOutputStream(uri);
                        if (os != null) {
                            os.write(text.getBytes("UTF-8"));
                            os.close();
                            return true;
                        }
                    }
                } catch (Exception e) {
                    // fall through to sharing
                }
            }
            final Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("text/plain");
            send.putExtra(Intent.EXTRA_SUBJECT, name);
            send.putExtra(Intent.EXTRA_TEXT, text);
            act.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    act.startActivity(Intent.createChooser(send, "Save your Sprout Siege progress"));
                }
            });
            return false;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PICK_FILE && pendingPick != null) {
            Uri[] result = null;
            if (resultCode == RESULT_OK && data != null && data.getData() != null) result = new Uri[] { data.getData() };
            pendingPick.onReceiveValue(result);
            pendingPick = null;
        }
    }

    @SuppressWarnings("deprecation")
    private void hideSystemUi() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemUi();
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (web != null) web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
        hideSystemUi();
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        // Let the game handle Back (close menus / pause). Exit only from the main menu.
        web.evaluateJavascript("(window.sproutBack && window.sproutBack()) ? 'y' : 'n'", this);
    }

    /** Result of the Back-button query sent to the game. */
    @Override
    public void onReceiveValue(String v) {
        if (v == null || !v.contains("y")) finish();
    }
}
