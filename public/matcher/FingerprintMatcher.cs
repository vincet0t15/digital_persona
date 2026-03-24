using System;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using DPUruNet;

class FingerprintMatcher
{
    private const int DPFJ_PROBABILITY_ONE = 0x7fffffff;
    private static int THRESHOLD = DPFJ_PROBABILITY_ONE / 100000;

    // P/Invoke to dpfj.dll for direct feature extraction from raw image
    [DllImport("dpfj.dll", CallingConvention = CallingConvention.Cdecl)]
    static extern int dpfj_create_fmd_from_raw(
        byte[] image_data,
        uint image_size,
        uint image_width,
        uint image_height,
        uint image_dpi,
        uint finger_pos,
        uint cbeff_id,
        int fmd_type, // CYCLIX_FMD_ANSI_378_2004 = 0x001B0001
        byte[] fmd_data,
        ref uint fmd_size
    );

    static int Main(string[] args)
    {
        try
        {
            if (args.Length < 1)
            {
                Console.WriteLine("{\"success\":false,\"error\":\"No command. Usage: identify|verify|png2fmd <args>\"}");
                return 1;
            }

            string command = args[0].ToLower();

            switch (command)
            {
                case "identify":
                    return DoIdentify(args);
                case "verify":
                    return DoVerify(args);
                case "png2fmd":
                    return DoPng2Fmd(args);
                default:
                    Console.WriteLine("{\"success\":false,\"error\":\"Unknown command: " + command + "\"}");
                    return 1;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("{\"success\":false,\"error\":\"" + EscapeJson(ex.Message) + "\"}");
            return 1;
        }
    }

    /// <summary>
    /// Convert PNG to ANSI 378 FMD using dpfj.dll directly
    /// </summary>
    static int DoPng2Fmd(string[] args)
    {
        if (args.Length < 2)
        {
            Console.WriteLine("{\"success\":false,\"error\":\"Usage: png2fmd <png_base64_file>\"}");
            return 1;
        }

        string b64 = File.ReadAllText(args[1]).Trim();
        
        // Remove data URI prefix if present
        if (b64.Contains(","))
        {
            b64 = b64.Substring(b64.IndexOf(",") + 1);
        }

        // Clean up base64: remove whitespace, newlines, carriage returns
        b64 = b64.Replace("\r", "").Replace("\n", "").Replace(" ", "").Replace("\t", "");
        
        // Fix padding
        while (b64.Length % 4 != 0)
        {
            b64 += "=";
        }

        byte[] pngBytes = Convert.FromBase64String(b64);

        // Load PNG and convert to 8-bit grayscale raw data
        Bitmap bmp;
        using (MemoryStream ms = new MemoryStream(pngBytes))
        {
            bmp = new Bitmap(ms);
        }

        int width = bmp.Width;
        int height = bmp.Height;
        int dpi = 500; // U.are.U 4500 = 500 DPI

        // Convert to grayscale raw bytes
        byte[] rawPixels = new byte[width * height];
        for (int y = 0; y < height; y++)
        {
            for (int x = 0; x < width; x++)
            {
                Color pixel = bmp.GetPixel(x, y);
                rawPixels[y * width + x] = (byte)(0.299 * pixel.R + 0.587 * pixel.G + 0.114 * pixel.B);
            }
        }
        bmp.Dispose();

        // Call dpfj_create_fmd_from_raw
        uint fmdSize = 0;
        int fmdType = 0x001B0001; // ANSI 378-2004
        
        // First call to get required size
        int result = dpfj_create_fmd_from_raw(
            rawPixels, (uint)rawPixels.Length,
            (uint)width, (uint)height, (uint)dpi,
            0, 0, fmdType,
            null, ref fmdSize
        );

        if (fmdSize == 0)
        {
            // Try with a large buffer
            fmdSize = 65536;
        }

        byte[] fmdData = new byte[fmdSize];
        result = dpfj_create_fmd_from_raw(
            rawPixels, (uint)rawPixels.Length,
            (uint)width, (uint)height, (uint)dpi,
            0, 0, fmdType,
            fmdData, ref fmdSize
        );

        if (result != 0)
        {
            Console.WriteLine("{\"success\":false,\"error\":\"dpfj_create_fmd_from_raw failed with code: 0x" + result.ToString("X8") + 
                ", width=" + width + ", height=" + height + ", rawLen=" + rawPixels.Length + "\"}");
            return 1;
        }

        // Trim to actual size
        byte[] fmdTrimmed = new byte[fmdSize];
        Array.Copy(fmdData, fmdTrimmed, fmdSize);

        // Create FMD object and serialize
        Fmd fmd = new Fmd(fmdTrimmed, (int)Constants.Formats.Fmd.ANSI, Constants.WRAPPER_VERSION);
        string fmdXml = Fmd.SerializeXml(fmd);
        string fmdB64 = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(fmdXml));

        Console.WriteLine("{\"success\":true,\"fmd\":\"" + fmdB64 + "\",\"width\":" + width + ",\"height\":" + height + "}");
        return 0;
    }

    /// <summary>
    /// Load a serialized FMD from file (base64-encoded XML)
    /// </summary>
    static Fmd LoadFmd(string filePath)
    {
        string content = File.ReadAllText(filePath).Trim();
        byte[] xmlBytes = Convert.FromBase64String(content);
        string xml = System.Text.Encoding.UTF8.GetString(xmlBytes);
        return Fmd.DeserializeXml(xml);
    }

    /// <summary>
    /// Identify: 1:N matching
    /// </summary>
    static int DoIdentify(string[] args)
    {
        if (args.Length < 3)
        {
            Console.WriteLine("{\"success\":false,\"error\":\"Usage: identify <captured_fmd_file> <gallery_file>\"}");
            return 1;
        }

        Fmd capturedFmd = LoadFmd(args[1]);

        string[] lines = File.ReadAllLines(args[2]);
        List<string> ids = new List<string>();
        List<Fmd> gallery = new List<Fmd>();

        foreach (string line in lines)
        {
            if (string.IsNullOrEmpty(line.Trim())) continue;
            string[] parts = line.Split(new char[] { '|' }, 2);
            if (parts.Length == 2)
            {
                try
                {
                    string tmpFile = Path.GetTempFileName();
                    File.WriteAllText(tmpFile, parts[1].Trim());
                    Fmd fmd = LoadFmd(tmpFile);
                    File.Delete(tmpFile);
                    ids.Add(parts[0].Trim());
                    gallery.Add(fmd);
                }
                catch { }
            }
        }

        if (gallery.Count == 0)
        {
            Console.WriteLine("{\"success\":true,\"match\":false,\"message\":\"No valid templates in gallery\"}");
            return 0;
        }

        IdentifyResult identifyResult = Comparison.Identify(capturedFmd, 0, gallery.ToArray(), THRESHOLD, gallery.Count);

        if (identifyResult.ResultCode != Constants.ResultCode.DP_SUCCESS)
        {
            Console.WriteLine("{\"success\":false,\"error\":\"Identify failed: " + identifyResult.ResultCode.ToString() + "\"}");
            return 1;
        }

        if (identifyResult.Indexes != null && identifyResult.Indexes.Length > 0)
        {
            int matchIndex = identifyResult.Indexes[0][0];
            string matchedId = ids[matchIndex];

            CompareResult cr = Comparison.Compare(capturedFmd, 0, gallery[matchIndex], 0);
            double confidence = CalcConfidence(cr.Score);

            Console.WriteLine("{\"success\":true,\"match\":true,\"person_id\":" + matchedId +
                ",\"score\":" + confidence.ToString("F1") +
                ",\"dissimilarity\":" + cr.Score +
                ",\"total_matches\":" + identifyResult.Indexes.Length + "}");
        }
        else
        {
            Console.WriteLine("{\"success\":true,\"match\":false,\"message\":\"No matching fingerprint found\"}");
        }

        return 0;
    }

    /// <summary>
    /// Verify: 1:1 matching
    /// </summary>
    static int DoVerify(string[] args)
    {
        if (args.Length < 3)
        {
            Console.WriteLine("{\"success\":false,\"error\":\"Usage: verify <fmd1_file> <fmd2_file>\"}");
            return 1;
        }

        Fmd fmd1 = LoadFmd(args[1]);
        Fmd fmd2 = LoadFmd(args[2]);

        CompareResult cr = Comparison.Compare(fmd1, 0, fmd2, 0);
        if (cr.ResultCode != Constants.ResultCode.DP_SUCCESS)
        {
            Console.WriteLine("{\"success\":false,\"error\":\"Compare failed: " + cr.ResultCode.ToString() + "\"}");
            return 1;
        }

        bool isMatch = cr.Score < THRESHOLD;
        double confidence = CalcConfidence(cr.Score);

        Console.WriteLine("{\"success\":true,\"match\":" + (isMatch ? "true" : "false") +
            ",\"score\":" + confidence.ToString("F1") +
            ",\"dissimilarity\":" + cr.Score + "}");
        return 0;
    }

    static double CalcConfidence(int dissimilarity)
    {
        if (dissimilarity == 0) return 100;
        if (dissimilarity >= DPFJ_PROBABILITY_ONE) return 0;
        return Math.Round((1.0 - (double)dissimilarity / (double)DPFJ_PROBABILITY_ONE) * 100.0, 1);
    }

    static string EscapeJson(string s)
    {
        if (s == null) return "";
        return s.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n").Replace("\r", "\\r");
    }
}
