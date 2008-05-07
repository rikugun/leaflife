package leaflife.widget.jsrpc;

import java.io.IOException;
import java.util.Locale;
import java.util.Properties;
import java.util.logging.Logger;

/**
 * The base exception of JS-RPC exceptions.
 * @author huangchao
 */
public class RPCException extends Exception
{
    private static String EXCEPTION_FILENAME_PREFIX = "/exception_";  // the exception definition filename prefix
    private static Properties msgs_default = new Properties();  // the default error messages <code, error message (english)>
    private static Properties msgs_local = new Properties();  // the localized error messages <code, error message (local language)>
    private String code;  // the error code
    private transient static Logger logger = Logger.getLogger(RPCException.class.getName());
    private static final long serialVersionUID = -7484679434716707717L;

    static
    {
        try
        {
            msgs_default.load(RPCException.class.getResourceAsStream(EXCEPTION_FILENAME_PREFIX + Locale.ENGLISH + ".properties"));
            Locale locale = Locale.getDefault();
            msgs_local.load(RPCException.class.getResourceAsStream(EXCEPTION_FILENAME_PREFIX + locale.getLanguage() + "_" + locale.getCountry() + ".properties"));
        }
        catch (IOException e)
        {
            logger.severe("Load exception message configuration failed (exception.properties). " + e.getMessage());
        }
    }

    public RPCException(String code)
    {
        this.code = code;
    }

    public RPCException(Throwable e)
    {
        super(e);
    }

    public String getMessage()
    {
        return code == null ? super.getMessage() : msgs_default.getProperty(code);
    }

    public String getMessage(String code)
    {
        return msgs_default.getProperty(code);
    }

    public String getLocalizedMessage()
    {
        if (code == null)
        {
            return super.getLocalizedMessage();
        }
        else
        {
            String result = msgs_local.getProperty(code);
            return result == null ? getMessage() : result;
        }
    }

    public String getLocalizedMessage(String code)
    {
        String result = msgs_local.getProperty(code);
        return result == null ? getMessage(code) : result;
    }

    public String getCode()
    {
        return code;
    }
}
