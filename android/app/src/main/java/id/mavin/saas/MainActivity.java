package id.mavin.saas;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.core.app.ActivityCompat;
import com.getcapacitor.BridgeActivity;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.UUID;
import org.json.JSONArray;
import org.json.JSONObject;

public class MainActivity extends BridgeActivity {
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00005f9b34fb");

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView webView = this.bridge.getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);
            settings.setDatabaseEnabled(true);

            // Add JavaScript Interface for Native Bluetooth Thermal Printing
            webView.addJavascriptInterface(new BluetoothPrinterInterface(this), "AndroidBluetoothPrinter");
        }

        // Request Bluetooth permissions on Android 12+ (API 31+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED ||
                ActivityCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_SCAN) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, new String[]{
                    Manifest.permission.BLUETOOTH_CONNECT,
                    Manifest.permission.BLUETOOTH_SCAN,
                    Manifest.permission.ACCESS_FINE_LOCATION
                }, 101);
            }
        }
    }

    public static class BluetoothPrinterInterface {
        private final Context context;

        public BluetoothPrinterInterface(Context context) {
            this.context = context;
        }

        @JavascriptInterface
        public boolean isAvailable() {
            return true;
        }

        @JavascriptInterface
        public String getPairedDevices() {
            try {
                BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
                if (adapter == null || !adapter.isEnabled()) {
                    return "[]";
                }
                Set<BluetoothDevice> pairedDevices = adapter.getBondedDevices();
                JSONArray arr = new JSONArray();
                if (pairedDevices != null) {
                    for (BluetoothDevice dev : pairedDevices) {
                        JSONObject obj = new JSONObject();
                        obj.put("name", dev.getName() != null ? dev.getName() : "Unknown Printer");
                        obj.put("address", dev.getAddress());
                        arr.put(obj);
                    }
                }
                return arr.toString();
            } catch (Exception e) {
                return "[]";
            }
        }

        @JavascriptInterface
        public String printReceipt(String textContent, String targetAddress) {
            BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
            if (adapter == null) {
                return "ERROR: Bluetooth tidak didukung pada perangkat ini";
            }
            if (!adapter.isEnabled()) {
                return "ERROR: Bluetooth HP sedang non-aktif. Harap nyalakan Bluetooth";
            }

            BluetoothDevice targetDevice = null;
            Set<BluetoothDevice> pairedDevices = adapter.getBondedDevices();

            if (pairedDevices == null || pairedDevices.isEmpty()) {
                return "ERROR: Tidak ada printer Bluetooth yang terhubung. Pasangkan (pair) printer di menu Pengaturan Bluetooth HP terlebih dahulu";
            }

            if (targetAddress != null && !targetAddress.isEmpty()) {
                for (BluetoothDevice dev : pairedDevices) {
                    if (dev.getAddress().equalsIgnoreCase(targetAddress)) {
                        targetDevice = dev;
                        break;
                    }
                }
            }

            // Fallback: auto-detect printer by common naming pattern
            if (targetDevice == null) {
                for (BluetoothDevice dev : pairedDevices) {
                    String name = dev.getName();
                    if (name != null) {
                        String lower = name.toLowerCase();
                        if (lower.contains("print") || lower.contains("pos") || lower.contains("rpp") ||
                            lower.contains("pt-") || lower.contains("58") || lower.contains("80") ||
                            lower.contains("bt") || lower.contains("thermal") || lower.contains("mpt")) {
                            targetDevice = dev;
                            break;
                        }
                    }
                }
            }

            // Fallback: pick first paired device
            if (targetDevice == null) {
                targetDevice = pairedDevices.iterator().next();
            }

            BluetoothSocket socket = null;
            OutputStream outputStream = null;
            try {
                if (adapter.isDiscovering()) {
                    adapter.cancelDiscovery();
                }

                socket = targetDevice.createRfcommSocketToServiceRecord(SPP_UUID);
                socket.connect();
                outputStream = socket.getOutputStream();

                // ESC/POS Initialization
                outputStream.write(new byte[]{0x1B, 0x40}); // ESC @ (Reset)
                outputStream.write(new byte[]{0x1B, 0x74, 0x00}); // Character code table: PC437

                // Write Receipt Text
                byte[] textBytes = textContent.getBytes(StandardCharsets.ISO_8859_1);
                outputStream.write(textBytes);

                // Feed 4 lines & cut
                outputStream.write(new byte[]{0x0A, 0x0A, 0x0A, 0x0A});
                outputStream.write(new byte[]{0x1D, 0x56, 0x41, 0x03});
                outputStream.flush();

                return "SUCCESS: Berhasil mencetak ke " + targetDevice.getName();
            } catch (Exception e) {
                // Secondary fallback attempt: reflection RFCOMM socket
                try {
                    if (socket != null) socket.close();
                    java.lang.reflect.Method m = targetDevice.getClass().getMethod("createRfcommSocket", new Class[]{int.class});
                    socket = (BluetoothSocket) m.invoke(targetDevice, 1);
                    socket.connect();
                    outputStream = socket.getOutputStream();

                    outputStream.write(new byte[]{0x1B, 0x40});
                    byte[] textBytes = textContent.getBytes(StandardCharsets.ISO_8859_1);
                    outputStream.write(textBytes);
                    outputStream.write(new byte[]{0x0A, 0x0A, 0x0A, 0x0A});
                    outputStream.flush();

                    return "SUCCESS: Berhasil mencetak ke " + targetDevice.getName();
                } catch (Exception e2) {
                    return "ERROR: Gagal terhubung ke " + targetDevice.getName() + " (" + e.getMessage() + "). Pastikan printer menyala dan terpasang di Bluetooth HP.";
                }
            } finally {
                try {
                    if (outputStream != null) outputStream.close();
                    if (socket != null) socket.close();
                } catch (Exception ignored) {}
            }
        }
    }
}
