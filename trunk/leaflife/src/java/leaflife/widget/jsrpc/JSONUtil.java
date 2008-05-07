package leaflife.widget.jsrpc;

import java.nio.CharBuffer;

import leaflife.widget.jsrpc.serializer.Serializer;
import leaflife.widget.jsrpc.serializer.SerializerFactory;

import test.Tester;

/**
 * A JSONParser create serializer object to parse JSON string to Java objects.
 * @author huangchao
 */
public class JSONUtil
{
    public static String marshall(Object obj) throws RPCException
    {
        Serializer serializer = SerializerFactory.getInstance().getSerializer(obj.getClass());
        return serializer.marshall(obj, 1);
    }

    public static Object unmarshall(String source, Class cls) throws RPCException
    {
        Serializer serializer = SerializerFactory.getInstance().getSerializer(cls);
        Tokener tokener = new Tokener(CharBuffer.wrap(source));
        try
        {
            return serializer.unmarshall(tokener, cls);
        }
        catch (RPCException e)
        {
            System.err.println(e.getMessage() + ":\n" + tokener.getClip());
            throw e;
        }
    }

    public static void main(String[] args)
    {
        String str = "{" +
                     "  'a': 2," +
                     "  \"b\": \"≤‚ ‘ w/\\\"{}\\nwee\"," +
                     "  'c': [1,2,3,4]," +
                     "  \"d\": " +
                     "  [" +
                     "      {" +
                     "          'a':2," +
                     "          'b':'≤ﬂ'" +
                     "      }" +
                     "  ]" +
                     "}";
        try
        {
/*
            long start_time = System.currentTimeMillis();  // start parsing (Mon Sep 24 10:12:42 CST 2007, 1190599962610L)

            ArrayList methods = new ArrayList();
            ReflectUtils.addAllMethods(test.Tester.class, methods);
            for (int i = 0; i < methods.size(); ++ i)
            {
                System.out.println(((Method) methods.get(i)).getName());
            }

            PropertyDescriptor[] props = ReflectUtils.getBeanGetters(test.Tester.class);
            Method[] methods = ReflectUtils.getPropertyMethods(props, true, false);
            for (int i = 0; i < methods.length; ++ i)
            {
                System.out.println(methods[i].getName());
            }

            System.out.println("Time: " + (System.currentTimeMillis() - start_time) + "ms");  // elapse time
            start_time = System.currentTimeMillis();
            test.Tester.class.getMethods();
            for (int i = 0; i < methods.size(); ++ i)
            {
                System.out.println(((Method) methods.get(i)).getName());
            }
            System.out.println("Time: " + (System.currentTimeMillis() - start_time) + "ms");  // elapse time
*/

            long start_time = System.currentTimeMillis();  // start parsing (Mon Sep 24 10:12:42 CST 2007, 1190599962610L)
            Tester t = (Tester) JSONUtil.unmarshall(str, Tester.class);
            long end_time = System.currentTimeMillis();
            System.out.println("Unmarshall time: " + (end_time - start_time) + "ms");  // elapse time
            start_time = end_time;
            System.out.println(JSONUtil.marshall(t));
            end_time = System.currentTimeMillis();
            System.out.println("Marshall time: " + (end_time - start_time) + "ms");  // elapse time

        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
    }
}
