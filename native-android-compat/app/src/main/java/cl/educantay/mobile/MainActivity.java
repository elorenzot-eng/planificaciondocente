package cl.educantay.mobile;

import android.app.Activity;
import android.os.Bundle;
import android.graphics.Color;
import android.view.Gravity;
import android.widget.LinearLayout;
import android.widget.TextView;

public final class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setBackgroundColor(Color.WHITE);
        root.setPadding(40, 40, 40, 40);

        TextView title = new TextView(this);
        title.setText("EducAntay");
        title.setTextSize(34f);
        title.setTextColor(Color.rgb(8,47,109));
        title.setGravity(Gravity.CENTER);

        TextView message = new TextView(this);
        message.setText("\nANDROID COMPATIBLE\n\nLa aplicación inició correctamente.");
        message.setTextSize(18f);
        message.setTextColor(Color.rgb(36,113,60));
        message.setGravity(Gravity.CENTER);

        root.addView(title);
        root.addView(message);
        setContentView(root);
    }
}
