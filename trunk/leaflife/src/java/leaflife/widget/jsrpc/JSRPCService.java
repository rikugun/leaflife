package leaflife.widget.jsrpc;

import java.io.BufferedReader;
import java.io.CharArrayWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.nio.CharBuffer;
import java.util.logging.Logger;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import leaflife.widget.jsrpc.serializer.SerializerFactory;


public class JSRPCService extends HttpServlet
{
    private final static int BUFFER_SIZE = 4096;  // the max size of character buffer
    private SerializerFactory serializer_factory = SerializerFactory.getInstance();
    private transient static Logger logger = Logger.getLogger(JSRPCService.class.getName());
    private static final long serialVersionUID = 7043271453100901443L;

    private JSRPCService()
    {
        
    }

    public void init(ServletConfig config) throws ServletException
    {
        try
        {
            // set the max marshall level
            serializer_factory.setMaxMarshallLevel(Integer.parseInt(config.getInitParameter("MaxMarshallLevel")));
        }
        catch (NumberFormatException e)
        {
            logger.severe("Invalid config \"MaxMarshallLevel\".");
            throw new ServletException(e.getCause());
        }
    }

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {
        long start_time = System.currentTimeMillis();  // start parsing (Mon Sep 24 10:12:42 CST 2007, 1190599962610L)
        String result = null;
        try
        {
            String path = request.getPathInfo();  // "/class name/method name"
            if (path == null)
            {
                throw new InvocationException("301");  // invalid request URL
            }
            else
            {
                // parse the class name and method name
                String[] path_parsed = path.split("/");
                if (path_parsed.length != 3)
                {
                    throw new InvocationException("301");  // invalid request URL
                }
                String class_name = path_parsed[1];  // class name
                if (class_name == null || class_name.length() == 0)
                {
                    throw new InvocationException("302");  // no class name specified
                }
                String method_name = path_parsed[2];  // method name
                if (method_name == null || method_name.length() == 0)
                {
                    throw new InvocationException("305");  // no method name specified
                }
                BufferedReader reader = new BufferedReader(new InputStreamReader(request.getInputStream(), "UTF-8"));  // always using UTF-8 encoding
                CharArrayWriter data = new CharArrayWriter();
                char[] buf = new char[BUFFER_SIZE];
                int len_readed;
                while ((len_readed = reader.read(buf)) != -1)
                {
                    data.write(buf, 0, len_readed);
                }
                String arguments = data.toString();
//                String arguments = URLDecoder.decode(data.toString(), "UTF-8");
                logger.fine("JS-RPC request: Class: " + class_name + ", Method: " + method_name + ", Arguments: " + arguments);
                Tokener tokener = new Tokener(CharBuffer.wrap(arguments));
                try
                {
                    result = invoke(class_name, method_name, tokener, request);
                    logger.fine("JS-RPC response: " + result);
                }
                catch (InvalidJSONSyntaxException e)  // invalid JSON syntax
                {
                    logger.severe("JS-RPC localized exception: " + e.getLocalizedMessage() + "\n" + tokener.getClip());
                    result = e.getLocalizedMessage("100") + " (" + e.getCode() + ")";
                    throw e;
                }
                catch (UnmarshallException e)  // can not convert JSON string to java object
                {
                    logger.severe("JS-RPC localized exception: " + e.getLocalizedMessage());
                    result = e.getLocalizedMessage("200") + " (" + e.getCode() + ")";
                    throw e;
                }
                catch (MarshallException e)  // can not convert java object to JSON string 
                {
                    logger.severe("JS-RPC localized exception: " + e.getLocalizedMessage());
                    result = e.getLocalizedMessage("250") + " (" + e.getCode() + ")";
                    throw e;
                }
                catch (InvocationTargetException e)  // user error
                {
                    result = e.getCause().getLocalizedMessage();
                    logger.severe("JS-RPC localized exception: " + result);
                    throw new RPCException(e.getCause());
                }
            }
        }
        catch (InvocationException e)  // invoke failed
        {
            logger.severe("JS-RPC localized exception: " + e.getLocalizedMessage());
            logger.severe("JS-RPC exception: " + e.getMessage());
            result = e.getLocalizedMessage("300") + " (" + e.getCode() + ")";
            response.setHeader("RemoteException", "1");
        }
        catch (RPCException e)
        {
            logger.severe("JS-RPC exception: " + e.getMessage());
            response.setHeader("RemoteException", "1");
        }
        logger.fine("JS-RPC time: " + (System.currentTimeMillis() - start_time) + "ms elapsed");  // elapse time
        response.setContentType("text/plain;charset=UTF-8");
        if (result != null)
        {
            byte[] result_byte = result.getBytes("UTF-8");
            response.setContentLength(result_byte.length);
            ServletOutputStream out = response.getOutputStream();
            out.write(result_byte);
            out.flush();
            out.close();
        }
    }

    private String invoke(String class_name, String method_name, Tokener tokener, HttpServletRequest request) throws InvalidJSONSyntaxException, MarshallException, UnmarshallException, InvocationException, InvocationTargetException
    {
        try
        {
            // create the class instance and method instance
            Class cls = Class.forName(class_name);
            Method method = MethodIntrospector.getInvokeMethod(cls, method_name);
            if (method == null)
            {
                throw new InvocationException("306");  // can not find the specified method
            }
            // parse the arguments
            Object[] args = serializer_factory.getArraySerializer().unmarshall(tokener, method.getParameterTypes());
            // invoke the method
            Object obj = cls.newInstance();
            if (obj instanceof InvocationContext)  // set request context
            {
                ((InvocationContext) obj).setRequestContext(request);
            }
            Object result = method.invoke(obj, args);
            // marshall the result
            return result == null ? "" : serializer_factory.getSerializer(result.getClass()).marshall(result, 1);
        }
        catch (ClassNotFoundException e)  // the specified class is not found
        {
            throw new InvocationException("303");
        }
        catch (IllegalAccessException e)  // access to the the specified method denied
        {
            throw new InvocationException("309");
        }
        catch (InstantiationException e)  // can not instantiate the specified class (nullary constructor, interface or abstract class)
        {
            throw new InvocationException("304");
        }
        catch (IllegalArgumentException e)  // invalid arguments
        {
            throw new InvocationException("307");
        }
    }
}
