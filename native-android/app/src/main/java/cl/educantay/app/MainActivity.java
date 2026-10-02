package cl.educantay.app;

import android.app.Activity;
import android.os.Bundle;
import android.graphics.Color;
import android.view.Gravity;
import android.widget.LinearLayout;
import android.widget.TextView;

public class MainActivity extends Activity {
  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    LinearLayout root = new LinearLayout(this);
    root.setOrientation(LinearLayout.VERTICAL);
    root.setGravity(Gravity.CENTER);
    root.setPadding(48,48,48,48);
    root.setBackgroundColor(Color.rgb(244,246,248));

    TextView title = new TextView(this);
    title.setText("EducAntay");
    title.setTextSize(36);
    title.setTextColor(Color.rgb(8,47,109));
    title.setGravity(Gravity.CENTER);

    TextView status = new TextView(this);
    status.setText("\n✓ Android nativo inició correctamente");
    status.setTextSize(18);
    status.setTextColor(Color.rgb(36,113,60));
    status.setGravity(Gravity.CENTER);

    root.addView(title);
    root.addView(status);
    setContentView(root);
  }
}
