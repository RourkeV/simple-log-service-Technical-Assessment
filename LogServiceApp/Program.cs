using System;
using System.Windows.Forms;

namespace LogServiceApp
{
    static class Program
    {

        //form entry point
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new logForm());
        }
    }
}